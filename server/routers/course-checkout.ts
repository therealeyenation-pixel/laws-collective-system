import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import Stripe from "stripe";
import { COURSE_PRODUCTS, CONSULTING_PRODUCTS, ALL_PRODUCTS } from "../stripe/course-products";
import { db } from "../db";
import { coursePurchases, consultingBookings, purchasedCourseProgress, courseCompletions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export const courseCheckoutRouter = router({
  // Get all available products
  getProducts: publicProcedure.query(() => {
    const courses = Object.entries(COURSE_PRODUCTS).map(([key, product]) => ({
      key,
      ...product,
      priceFormatted: `$${(product.price / 100).toFixed(2)}`,
      category: "course" as const,
    }));

    const consulting = Object.entries(CONSULTING_PRODUCTS).map(([key, product]) => ({
      key,
      ...product,
      priceFormatted: `$${(product.price / 100).toFixed(2)}`,
      category: "consulting" as const,
    }));

    return { courses, consulting };
  }),

  // Get single product details
  getProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(({ input }) => {
      const product = Object.values(ALL_PRODUCTS).find((p) => p.id === input.productId);
      if (!product) {
        throw new Error("Product not found");
      }
      return {
        ...product,
        priceFormatted: `$${(product.price / 100).toFixed(2)}`,
      };
    }),

  // Create checkout session for course purchase
  createCourseCheckout: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        customerEmail: z.string().email(),
        customerName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = COURSE_PRODUCTS.lawsFoundation;
      
      if (input.productId !== product.id) {
        throw new Error("Invalid product");
      }

      const origin = ctx.req?.headers?.origin || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: input.customerEmail,
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        metadata: {
          product_id: product.id,
          product_type: "course",
          customer_email: input.customerEmail,
          customer_name: input.customerName || "",
        },
        success_url: `${origin}/course-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/products?canceled=true`,
      });

      // Create pending purchase record
      await db.insert(coursePurchases).values({
        customerEmail: input.customerEmail,
        customerName: input.customerName || null,
        productId: product.id,
        productName: product.name,
        productType: "course",
        amount: (product.price / 100).toFixed(2),
        currency: "USD",
        stripeSessionId: session.id,
        paymentStatus: "pending",
        accessGranted: false,
      });

      return { checkoutUrl: session.url };
    }),

  // Create checkout session for consulting
  createConsultingCheckout: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        customerEmail: z.string().email(),
        customerName: z.string(),
        customerPhone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = Object.values(CONSULTING_PRODUCTS).find((p) => p.id === input.productId) as any;
      
      if (!product) {
        throw new Error("Invalid consulting product");
      }

      const origin = ctx.req?.headers?.origin || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: input.customerEmail,
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        metadata: {
          product_id: product.id,
          product_type: "consulting",
          customer_email: input.customerEmail,
          customer_name: input.customerName,
          customer_phone: input.customerPhone || "",
        },
        success_url: `${origin}/consulting-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/products?canceled=true`,
      });

      // Create pending booking record
      await db.insert(consultingBookings).values({
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        customerPhone: input.customerPhone || null,
        productId: product.id,
        productName: product.name,
        sessionDuration: parseInt(product.duration?.toString() || "90") || 90,
        amount: (product.price / 100).toFixed(2),
        currency: "USD",
        stripeSessionId: session.id,
        paymentStatus: "pending",
        sessionStatus: "pending_payment",
      });

      return { checkoutUrl: session.url };
    }),

  // Verify checkout session and grant access
  verifyCheckout: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
        expand: ["line_items", "customer"],
      });

      if (session.payment_status !== "paid") {
        return {
          success: false,
          message: "Payment not completed",
        };
      }

      const productType = session.metadata?.product_type;
      const productId = session.metadata?.product_id;

      if (productType === "course") {
        // Update course purchase record
        await db
          .update(coursePurchases)
          .set({
            paymentStatus: "completed",
            accessGranted: true,
            completedAt: new Date(),
          })
          .where(eq(coursePurchases.stripeSessionId, input.sessionId));

        return {
          success: true,
          productType: "course",
          productId,
          message: "Course access granted! Check your email for login details.",
          customerEmail: session.customer_email,
        };
      } else if (productType === "consulting") {
        // Update consulting booking record
        await db
          .update(consultingBookings)
          .set({
            paymentStatus: "completed",
            sessionStatus: "pending_scheduling",
          })
          .where(eq(consultingBookings.stripeSessionId, input.sessionId));

        return {
          success: true,
          productType: "consulting",
          productId,
          message: "Booking confirmed! You will receive a scheduling link via email.",
          customerEmail: session.customer_email,
        };
      }

      return {
        success: false,
        message: "Unknown product type",
      };
    }),

  // Check if user has access to a course
  checkCourseAccess: publicProcedure
    .input(z.object({ email: z.string().email(), courseId: z.string() }))
    .query(async ({ input }) => {
      const purchases = await db
        .select()
        .from(coursePurchases)
        .where(eq(coursePurchases.customerEmail, input.email));

      const hasAccess = purchases.some(
        (p) =>
          p.productId === input.courseId &&
          p.paymentStatus === "completed" &&
          p.accessGranted
      );

      return { hasAccess };
    }),

  // Get user's purchases
  getUserPurchases: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.email) {
      return { courses: [], consultations: [] };
    }

    const courses = await db
      .select()
      .from(coursePurchases)
      .where(eq(coursePurchases.customerEmail, ctx.user.email));

    const consultations = await db
      .select()
      .from(consultingBookings)
      .where(eq(consultingBookings.customerEmail, ctx.user.email));

    return { courses, consultations };
  }),

  // Get course progress for a purchase
  getCourseProgress: publicProcedure
    .input(z.object({ purchaseId: z.number(), email: z.string().email() }))
    .query(async ({ input }) => {
      const progress = await db
        .select()
        .from(purchasedCourseProgress)
        .where(eq(purchasedCourseProgress.purchaseId, input.purchaseId));

      const purchase = await db
        .select()
        .from(coursePurchases)
        .where(eq(coursePurchases.id, input.purchaseId));

      if (!purchase[0] || purchase[0].customerEmail !== input.email) {
        throw new Error("Access denied");
      }

      // Get course structure
      const course = COURSE_PRODUCTS.lawsFoundation;
      const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const completedLessons = progress.filter((p) => p.completed).length;

      return {
        progress,
        totalLessons,
        completedLessons,
        percentComplete: Math.round((completedLessons / totalLessons) * 100),
        isComplete: completedLessons === totalLessons,
      };
    }),

  // Mark lesson as complete
  markLessonComplete: publicProcedure
    .input(
      z.object({
        purchaseId: z.number(),
        email: z.string().email(),
        moduleId: z.string(),
        lessonIndex: z.number(),
        lessonTitle: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify purchase access
      const purchase = await db
        .select()
        .from(coursePurchases)
        .where(eq(coursePurchases.id, input.purchaseId));

      if (!purchase[0] || purchase[0].customerEmail !== input.email || !purchase[0].accessGranted) {
        throw new Error("Access denied");
      }

      // Check if already exists
      const existing = await db
        .select()
        .from(purchasedCourseProgress)
        .where(eq(purchasedCourseProgress.purchaseId, input.purchaseId));

      const alreadyCompleted = existing.find(
        (p) => p.moduleId === input.moduleId && p.lessonIndex === input.lessonIndex
      );

      if (alreadyCompleted) {
        return { success: true, alreadyCompleted: true };
      }

      // Insert progress record
      await db.insert(purchasedCourseProgress).values({
        purchaseId: input.purchaseId,
        customerEmail: input.email,
        courseId: purchase[0].productId,
        moduleId: input.moduleId,
        lessonIndex: input.lessonIndex,
        lessonTitle: input.lessonTitle,
        completed: true,
        completedAt: new Date(),
      });

      // Check if course is now complete
      const course = COURSE_PRODUCTS.lawsFoundation;
      const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const updatedProgress = await db
        .select()
        .from(purchasedCourseProgress)
        .where(eq(purchasedCourseProgress.purchaseId, input.purchaseId));
      const completedLessons = updatedProgress.filter((p) => p.completed).length;

      if (completedLessons === totalLessons) {
        // Course completed - create completion record
        await db.insert(courseCompletions).values({
          purchaseId: input.purchaseId,
          customerEmail: input.email,
          courseId: purchase[0].productId,
          courseName: purchase[0].productName,
          completedAt: new Date(),
          certificateIssued: false,
          upsellOffered: false,
        });
      }

      return {
        success: true,
        alreadyCompleted: false,
        courseComplete: completedLessons === totalLessons,
      };
    }),

  // Get course completion status and upsell info
  getCourseCompletion: publicProcedure
    .input(z.object({ purchaseId: z.number(), email: z.string().email() }))
    .query(async ({ input }) => {
      const completion = await db
        .select()
        .from(courseCompletions)
        .where(eq(courseCompletions.purchaseId, input.purchaseId));

      if (!completion[0]) {
        return { isComplete: false };
      }

      if (completion[0].customerEmail !== input.email) {
        throw new Error("Access denied");
      }

      // Get upsell product info
      const strategySession = CONSULTING_PRODUCTS.strategySession;

      return {
        isComplete: true,
        completion: completion[0],
        upsellProduct: {
          ...strategySession,
          priceFormatted: `$${(strategySession.price / 100).toFixed(2)}`,
        },
      };
    }),

  // Mark upsell as offered
  markUpsellOffered: publicProcedure
    .input(z.object({ completionId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(courseCompletions)
        .set({ upsellOffered: true })
        .where(eq(courseCompletions.id, input.completionId));
      return { success: true };
    }),
});
