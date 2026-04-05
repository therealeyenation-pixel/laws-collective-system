import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const interactiveDashboardBuilderRouter = router({
  // Dashboard Layout Management
  createDashboard: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        templateId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        dashboardId: `dash_${Date.now()}`,
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        created: true,
        timestamp: new Date(),
      };
    }),

  getDashboards: protectedProcedure.query(async ({ ctx }) => {
    return {
      dashboards: [
        {
          dashboardId: "dash_1",
          name: "Executive Overview",
          description: "High-level metrics for executives",
          widgetCount: 8,
          lastModified: new Date(Date.now() - 86400000),
          isDefault: true,
        },
        {
          dashboardId: "dash_2",
          name: "Campaign Manager",
          description: "Campaign performance tracking",
          widgetCount: 12,
          lastModified: new Date(Date.now() - 172800000),
          isDefault: false,
        },
      ],
      totalDashboards: 2,
    };
  }),

  getDashboardLayout: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        layout: {
          gridSize: 12,
          widgets: [
            {
              widgetId: "widget_1",
              type: "metric_card",
              position: { x: 0, y: 0, width: 3, height: 2 },
              config: { metric: "total_revenue", format: "currency" },
            },
            {
              widgetId: "widget_2",
              type: "chart",
              position: { x: 3, y: 0, width: 6, height: 4 },
              config: { chartType: "line", metric: "daily_revenue" },
            },
            {
              widgetId: "widget_3",
              type: "table",
              position: { x: 9, y: 0, width: 3, height: 4 },
              config: { dataSource: "campaigns", columns: ["name", "status"] },
            },
          ],
        },
        lastModified: new Date(),
      };
    }),

  updateDashboardLayout: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        layout: z.object({
          gridSize: z.number(),
          widgets: z.array(z.any()),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        updated: true,
        widgetCount: input.layout.widgets.length,
        timestamp: new Date(),
      };
    }),

  // Widget Management
  addWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgetType: z.enum([
          "metric_card",
          "chart",
          "table",
          "gauge",
          "heatmap",
          "timeline",
          "list",
          "custom",
        ]),
        config: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      return {
        widgetId: `widget_${Date.now()}`,
        dashboardId: input.dashboardId,
        type: input.widgetType,
        added: true,
        timestamp: new Date(),
      };
    }),

  removeWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgetId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        widgetId: input.widgetId,
        removed: true,
      };
    }),

  updateWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgetId: z.string(),
        config: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        widgetId: input.widgetId,
        updated: true,
        timestamp: new Date(),
      };
    }),

  // Widget Templates
  getWidgetTemplates: protectedProcedure.query(async () => {
    return {
      templates: [
        {
          templateId: "tmpl_metric",
          name: "Metric Card",
          category: "metrics",
          description: "Display a single metric with trend",
          defaultSize: { width: 3, height: 2 },
        },
        {
          templateId: "tmpl_chart",
          name: "Line Chart",
          category: "charts",
          description: "Time-series line chart",
          defaultSize: { width: 6, height: 4 },
        },
        {
          templateId: "tmpl_table",
          name: "Data Table",
          category: "data",
          description: "Sortable data table",
          defaultSize: { width: 6, height: 4 },
        },
        {
          templateId: "tmpl_gauge",
          name: "Gauge Chart",
          category: "metrics",
          description: "Circular gauge for progress",
          defaultSize: { width: 3, height: 3 },
        },
      ],
      totalTemplates: 4,
    };
  }),

  // Dashboard Templates
  getDashboardTemplates: protectedProcedure.query(async () => {
    return {
      templates: [
        {
          templateId: "dash_tmpl_exec",
          name: "Executive Dashboard",
          description: "High-level overview for executives",
          widgetCount: 8,
          category: "executive",
        },
        {
          templateId: "dash_tmpl_campaign",
          name: "Campaign Manager",
          description: "Campaign performance and analytics",
          widgetCount: 12,
          category: "marketing",
        },
        {
          templateId: "dash_tmpl_finance",
          name: "Financial Dashboard",
          description: "Revenue, expenses, and reconciliation",
          widgetCount: 10,
          category: "finance",
        },
      ],
      totalTemplates: 3,
    };
  }),

  createFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        dashboardName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        dashboardId: `dash_${Date.now()}`,
        userId: ctx.user.id,
        name: input.dashboardName,
        templateId: input.templateId,
        created: true,
        timestamp: new Date(),
      };
    }),

  // Drag & Drop Support
  reorderWidgets: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgets: z.array(
          z.object({
            widgetId: z.string(),
            position: z.object({
              x: z.number(),
              y: z.number(),
              width: z.number(),
              height: z.number(),
            }),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        reordered: true,
        widgetCount: input.widgets.length,
        timestamp: new Date(),
      };
    }),

  // Data Source Configuration
  configureDataSource: protectedProcedure
    .input(
      z.object({
        widgetId: z.string(),
        dataSource: z.enum([
          "campaigns",
          "members",
          "revenue",
          "investments",
          "reconciliation",
          "broadcasts",
        ]),
        filters: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        widgetId: input.widgetId,
        dataSource: input.dataSource,
        configured: true,
        timestamp: new Date(),
      };
    }),

  // Role-Based Dashboards
  assignDashboardToRole: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        role: z.enum(["admin", "manager", "member", "viewer"]),
      })
    )
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        role: input.role,
        assigned: true,
      };
    }),

  getDashboardsByRole: protectedProcedure
    .input(z.object({ role: z.string() }))
    .query(async ({ input }) => {
      return {
        role: input.role,
        dashboards: [
          {
            dashboardId: "dash_1",
            name: "Role Dashboard",
            isDefault: true,
          },
        ],
        totalDashboards: 1,
      };
    }),

  // Dashboard Sharing
  shareDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        userIds: z.array(z.string()),
        permissions: z.enum(["view", "edit", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        sharedWith: input.userIds.length,
        permissions: input.permissions,
        shared: true,
      };
    }),

  getSharedDashboards: protectedProcedure.query(async ({ ctx }) => {
    return {
      sharedDashboards: [
        {
          dashboardId: "dash_shared_1",
          name: "Executive Dashboard",
          owner: "admin@example.com",
          permissions: "view",
          sharedAt: new Date(Date.now() - 604800000),
        },
      ],
      totalShared: 1,
    };
  }),

  // Dashboard Versioning
  getDashboardVersions: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        versions: [
          {
            versionId: "v_1",
            timestamp: new Date(Date.now() - 604800000),
            modifiedBy: "user@example.com",
            changes: "Added revenue chart",
          },
          {
            versionId: "v_2",
            timestamp: new Date(Date.now() - 172800000),
            modifiedBy: "user@example.com",
            changes: "Updated widget positions",
          },
        ],
        totalVersions: 2,
      };
    }),

  restoreDashboardVersion: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        versionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        versionId: input.versionId,
        restored: true,
        timestamp: new Date(),
      };
    }),

  // Dashboard Export
  exportDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        format: z.enum(["json", "pdf", "image"]),
      })
    )
    .mutation(async ({ input }) => {
      return {
        exportId: `export_${Date.now()}`,
        dashboardId: input.dashboardId,
        format: input.format,
        status: "generated",
        url: `https://storage.example.com/dashboard_${input.dashboardId}.${input.format}`,
      };
    }),

  // Dashboard Favorites
  addToFavorites: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return {
        dashboardId: input.dashboardId,
        userId: ctx.user.id,
        added: true,
      };
    }),

  getFavoriteDashboards: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      favorites: [
        {
          dashboardId: "dash_1",
          name: "Executive Overview",
          addedAt: new Date(Date.now() - 604800000),
        },
      ],
      totalFavorites: 1,
    };
  }),
});
