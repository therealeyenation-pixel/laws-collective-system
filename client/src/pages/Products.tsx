import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Clock, 
  Star, 
  ArrowRight,
  Loader2,
  Map,
  Wind,
  Droplets,
  Heart,
  Calendar,
  Video,
  FileText,
  Award,
} from "lucide-react";

export default function Products() {
  const { data: products, isLoading } = trpc.courseCheckout.getProducts.useQuery();
  const createCourseCheckout = trpc.courseCheckout.createCourseCheckout.useMutation();
  const createConsultingCheckout = trpc.courseCheckout.createConsultingCheckout.useMutation();

  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showConsultingDialog, setShowConsultingDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleCourseCheckout = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const result = await createCourseCheckout.mutateAsync({
        productId: selectedProduct.id,
        customerEmail: email,
        customerName: name || undefined,
      });

      if (result.checkoutUrl) {
        toast.success("Redirecting to checkout...");
        window.open(result.checkoutUrl, "_blank");
        setShowCourseDialog(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout");
    }
  };

  const handleConsultingCheckout = async () => {
    if (!email || !name) {
      toast.error("Please enter your name and email");
      return;
    }

    try {
      const result = await createConsultingCheckout.mutateAsync({
        productId: selectedProduct.id,
        customerEmail: email,
        customerName: name,
        customerPhone: phone || undefined,
      });

      if (result.checkoutUrl) {
        toast.success("Redirecting to checkout...");
        window.open(result.checkoutUrl, "_blank");
        setShowConsultingDialog(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout");
    }
  };

  const moduleIcons = {
    land: <Map className="w-5 h-5" />,
    air: <Wind className="w-5 h-5" />,
    water: <Droplets className="w-5 h-5" />,
    self: <Heart className="w-5 h-5" />,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const course = products?.courses[0];
  const consulting = products?.consulting || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-green-50/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Transform Your Financial Future
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            L.A.W.S. Collective Products
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Build multi-generational wealth through education, strategy, and community support
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="consulting" className="gap-2">
              <Users className="w-4 h-4" />
              Consulting
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-8">
            {course && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Course Overview */}
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-600">Featured Course</Badge>
                      <Badge variant="outline">12+ Hours</Badge>
                    </div>
                    <CardTitle className="text-2xl">{course.name}</CardTitle>
                    <CardDescription className="text-base">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary">
                        {course.priceFormatted}
                      </span>
                      <span className="text-muted-foreground">one-time</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {course.features?.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full gap-2" 
                      size="lg"
                      onClick={() => {
                        setSelectedProduct(course);
                        setShowCourseDialog(true);
                      }}
                    >
                      Enroll Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Course Modules */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Course Curriculum</h3>
                  {course.modules?.map((module: any) => (
                    <Card key={module.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {moduleIcons[module.id as keyof typeof moduleIcons]}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {module.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            {module.lessons?.length || 5} lessons
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {module.lessons?.slice(0, 3).map((lesson: string, idx: number) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <FileText className="w-3 h-3" />
                              {lesson}
                            </li>
                          ))}
                          {module.lessons?.length > 3 && (
                            <li className="text-sm text-primary">
                              +{module.lessons.length - 3} more lessons
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Consulting Tab */}
          <TabsContent value="consulting" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {consulting.map((product: any) => (
                <Card key={product.key} className="border-2 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {product.duration}
                      </Badge>
                      {product.key === "strategySession" && (
                        <Badge className="bg-amber-600">Most Popular</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {product.priceFormatted}
                      </span>
                      <span className="text-muted-foreground">one-time</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {product.features?.slice(0, 5).map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {product.features?.length > 5 && (
                        <p className="text-sm text-primary">
                          +{product.features.length - 5} more benefits
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full gap-2"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowConsultingDialog(true);
                      }}
                    >
                      Book Session
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Testimonial Section */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-8">
                <div className="flex items-start gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>
                <blockquote className="mt-4 text-lg italic">
                  "The L.A.W.S. Strategy Session completely transformed how I think about 
                  building wealth for my family. The personalized roadmap gave me clear 
                  action steps I could implement immediately."
                </blockquote>
                <p className="mt-4 font-semibold">— L.A.W.S. Collective Member</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Guarantee Section */}
        <section className="mt-16 text-center">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="py-8">
              <Award className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">100% Satisfaction Guarantee</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're confident in the value of our programs. If you're not completely 
                satisfied within 30 days, we'll provide a full refund—no questions asked.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Course Checkout Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Enter your details to proceed to secure checkout
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{selectedProduct?.name}</span>
                <span className="text-xl font-bold text-primary">
                  {selectedProduct?.priceFormatted}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCourseCheckout}
              disabled={createCourseCheckout.isPending}
              className="gap-2"
            >
              {createCourseCheckout.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consulting Checkout Dialog */}
      <Dialog open={showConsultingDialog} onOpenChange={setShowConsultingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Enter your details to proceed to secure checkout
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="c-name">Name *</Label>
              <Input
                id="c-name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email *</Label>
              <Input
                id="c-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-phone">Phone (optional)</Label>
              <Input
                id="c-phone"
                type="tel"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{selectedProduct?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedProduct?.duration}</p>
                </div>
                <span className="text-xl font-bold text-primary">
                  {selectedProduct?.priceFormatted}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsultingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConsultingCheckout}
              disabled={createConsultingCheckout.isPending}
              className="gap-2"
            >
              {createConsultingCheckout.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
