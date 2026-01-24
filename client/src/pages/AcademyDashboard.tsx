import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { 
  GraduationCap, 
  BookOpen, 
  Globe2, 
  Flame,
  Users,
  Award,
  Scroll,
  ChevronRight,
  Sparkles,
  TreePine,
  Calculator,
  Code,
  Wrench,
  Leaf,
  Pen,
  Briefcase,
  Music,
  Languages,
  Shield,
  FileText,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";
import { GovernmentActionsWidget } from "@/components/GovernmentActionsWidget";

type TabType = "overview" | "houses" | "modules" | "languages" | "courses" | "simulators" | "documents";

const moduleIcons: Record<string, React.ReactNode> = {
  "science-origin-observation": <TreePine className="w-5 h-5" />,
  "mathematics-sacred-geometry": <Calculator className="w-5 h-5" />,
  "technology-light-code": <Code className="w-5 h-5" />,
  "engineering-purpose": <Wrench className="w-5 h-5" />,
  "living-earth-farming": <Leaf className="w-5 h-5" />,
  "spirit-writing-chants": <Pen className="w-5 h-5" />,
  "entrepreneurial-flame": <Briefcase className="w-5 h-5" />,
  "house-many-tongues": <Languages className="w-5 h-5" />,
  "ceremonial-arts": <Music className="w-5 h-5" />,
};

const houseColors: Record<string, string> = {
  "amber": "bg-amber-100 border-amber-300 text-amber-800",
  "emerald": "bg-emerald-100 border-emerald-300 text-emerald-800",
  "purple": "bg-emerald-100 border-purple-300 text-emerald-800",
};

const languageCategoryColors: Record<string, string> = {
  "indigenous": "bg-amber-50 border-amber-200",
  "ancestral_flame": "bg-emerald-50 border-emerald-200",
  "global_trade": "bg-blue-50 border-blue-200",
};

export default function AcademyDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  
  const { data: academyData, isLoading } = trpc.academy.getAcademyOverview.useQuery();

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: <Sparkles className="w-4 h-4" /> },
    { id: "houses" as TabType, label: "Houses", icon: <Flame className="w-4 h-4" /> },
    { id: "modules" as TabType, label: "Divine STEM", icon: <BookOpen className="w-4 h-4" /> },
    { id: "languages" as TabType, label: "Languages", icon: <Globe2 className="w-4 h-4" /> },
    { id: "courses" as TabType, label: "Courses", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "simulators" as TabType, label: "Simulators", icon: <Calculator className="w-4 h-4" /> },
    { id: "documents" as TabType, label: "Documents", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-medium">
              LuvOnPurpose Academy
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
              508(c)(1)(a)
            </Badge>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Luv Learning Academy</h1>
              <p className="text-gray-600">K-12 Sovereign Education System</p>
            </div>
          </div>
          <p className="mt-4 text-gray-700 max-w-3xl">
            A flame-based education system honoring ancestral wisdom, indigenous knowledge, 
            and sovereign skill-building. Three Houses guide students from Wonder through Mastery.
          </p>
        </div>

        {/* Government Actions */}
        <GovernmentActionsWidget department="academy" />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                      <Flame className="w-5 h-5" />
                      <span className="text-sm font-medium">Houses</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{academyData?.stats.totalHouses || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-sm font-medium">Modules</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{academyData?.stats.totalModules || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Globe2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Languages</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{academyData?.stats.totalLanguages || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <GraduationCap className="w-5 h-5" />
                      <span className="text-sm font-medium">Courses</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{academyData?.stats.totalCourses || 0}</p>
                  </div>
                </div>

                {/* Houses Preview */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-600" />
                    The Three Houses
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {academyData?.houses.map((house) => (
                      <div
                        key={house.id}
                        className={`rounded-xl p-5 border-2 ${houseColors[house.colorTheme || "amber"]}`}
                      >
                        <h3 className="text-lg font-bold mb-1">{house.name}</h3>
                        <p className="text-sm opacity-80 mb-2">{house.ceremonialName}</p>
                        <p className="text-sm mb-3">{house.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {house.gradeRange}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            Ages {house.ageRange}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divine STEM Preview */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Divine STEM Curriculum
                  </h2>
                  <div className="grid md:grid-cols-3 gap-3">
                    {academyData?.modules.slice(0, 6).map((module) => (
                      <div
                        key={module.id}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            {moduleIcons[module.slug] || <BookOpen className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{module.name}</h3>
                            <p className="text-xs text-gray-500">{module.ceremonialTitle}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Houses Tab */}
            {activeTab === "houses" && (
              <div className="space-y-6">
                {academyData?.houses.map((house) => (
                  <div
                    key={house.id}
                    className={`rounded-xl p-6 border-2 ${houseColors[house.colorTheme || "amber"]}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">{house.name}</h2>
                        <p className="text-lg opacity-80 italic">{house.ceremonialName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Grades {house.gradeRange}</p>
                        <p className="text-sm opacity-80">Ages {house.ageRange}</p>
                      </div>
                    </div>
                    <p className="mb-4">{house.description}</p>
                    
                    {/* Courses in this house */}
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Courses in this House
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2">
                        {academyData?.courses
                          .filter((c) => c.houseId === house.id)
                          .map((course) => (
                            <div
                              key={course.id}
                              className="bg-white/50 rounded-lg p-3 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium text-sm">{course.title}</p>
                                <p className="text-xs opacity-70">{course.level}</p>
                              </div>
                              <div className="flex items-center gap-1 text-amber-700">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">{course.tokensReward}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modules Tab */}
            {activeTab === "modules" && (
              <div className="space-y-4">
                {academyData?.modules.map((module) => (
                  <div
                    key={module.id}
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                        {moduleIcons[module.slug] || <BookOpen className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{module.name}</h3>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                            {module.category}
                          </span>
                        </div>
                        <p className="text-sm text-emerald-700 italic mb-2">{module.ceremonialTitle}</p>
                        <p className="text-gray-600">{module.description}</p>
                        
                        {/* Courses in this module */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {academyData?.courses
                            .filter((c) => c.moduleId === module.id)
                            .map((course) => (
                              <span
                                key={course.id}
                                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 flex items-center gap-1"
                              >
                                {course.title}
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Languages Tab */}
            {activeTab === "languages" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h2 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <Languages className="w-6 h-6" />
                    House of Many Tongues
                  </h2>
                  <p className="text-amber-800">
                    Global flame-language chamber for restoring, learning, and honoring sacred and world tongues.
                    Students choose languages to study alongside their core curriculum.
                  </p>
                </div>

                {/* Indigenous Languages */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-amber-600" />
                    Indigenous Tongues
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {academyData?.languages
                      .filter((l) => l.category === "indigenous")
                      .map((lang) => (
                        <div
                          key={lang.id}
                          className={`rounded-lg p-4 border ${languageCategoryColors[lang.category]}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">{lang.name}</h4>
                            <span className="text-lg">{lang.nativeName}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{lang.description}</p>
                          <p className="text-xs text-amber-700 italic">{lang.culturalContext}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Heritage Languages */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-emerald-600" />
                    Heritage Languages
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {academyData?.languages
                      .filter((l) => l.category === "ancestral_flame")
                      .map((lang) => (
                        <div
                          key={lang.id}
                          className={`rounded-lg p-4 border ${languageCategoryColors[lang.category]}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">{lang.name}</h4>
                            <span className="text-lg">{lang.nativeName}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{lang.description}</p>
                          <p className="text-xs text-emerald-700 italic">{lang.culturalContext}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Global Trade Languages */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-blue-600" />
                    Global Trade Tongues
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {academyData?.languages
                      .filter((l) => l.category === "global_trade")
                      .map((lang) => (
                        <div
                          key={lang.id}
                          className={`rounded-lg p-4 border ${languageCategoryColors[lang.category]}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">{lang.name}</h4>
                            <span className="text-lg">{lang.nativeName}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{lang.description}</p>
                          <p className="text-xs text-blue-700 italic">{lang.culturalContext}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                {/* Foundational Courses */}
                <div>
                  <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Foundational Courses (House of Wonder)
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {academyData?.courses
                      .filter((c) => c.level === "foundational")
                      .map((course) => (
                        <div
                          key={course.id}
                          className="bg-amber-50 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-bold text-amber-900 mb-1">{course.title}</h4>
                          <p className="text-sm text-amber-700 mb-3">{course.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">
                              {course.level}
                            </span>
                            <span className="flex items-center gap-1 text-amber-700 font-medium">
                              <Award className="w-4 h-4" />
                              {course.tokensReward} tokens
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Developing Courses */}
                <div>
                  <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Developing Courses (House of Form)
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {academyData?.courses
                      .filter((c) => c.level === "developing")
                      .map((course) => (
                        <div
                          key={course.id}
                          className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-bold text-emerald-900 mb-1">{course.title}</h4>
                          <p className="text-sm text-emerald-700 mb-3">{course.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded">
                              {course.level}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <Award className="w-4 h-4" />
                              {course.tokensReward} tokens
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Mastery Courses */}
                <div>
                  <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Mastery Courses (House of Mastery)
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {academyData?.courses
                      .filter((c) => c.level === "mastery")
                      .map((course) => (
                        <div
                          key={course.id}
                          className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-bold text-emerald-900 mb-1">{course.title}</h4>
                          <p className="text-sm text-emerald-700 mb-3">{course.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded">
                              {course.level}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <Award className="w-4 h-4" />
                              {course.tokensReward} tokens
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Simulators Tab */}
            {activeTab === "simulators" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs font-medium">
                      L.A.W.S. Collective Partner Program
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-green-900 mb-2 flex items-center gap-2">
                    <Calculator className="w-6 h-6" />
                    Business Training Simulators
                  </h2>
                  <p className="text-green-800 mb-4">
                    Business training simulators are provided through our partnership with The L.A.W.S. Collective, LLC. 
                    These practical simulations complement the Academy's sovereign education curriculum with real-world 
                    financial literacy and business readiness training.
                  </p>
                  <Button 
                    onClick={() => window.location.href = "/business-simulator"}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Go to L.A.W.S. Training Center
                  </Button>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">Available Training Programs</h3>
                  <p className="text-amber-800 text-sm mb-4">
                    The following simulators are available through L.A.W.S. Collective:
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Trust Formation Simulator */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <Shield className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Trust Formation</h3>
                        <p className="text-sm text-gray-500">12 modules</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Learn to create and manage family trusts, asset protection strategies, and estate planning.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Award className="w-4 h-4" />
                        500 tokens
                      </span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = "/getting-started"}>
                        Start
                      </Button>
                    </div>
                  </div>

                  {/* Business Plan Simulator */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Business Planning</h3>
                        <p className="text-sm text-gray-500">10 modules</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Create comprehensive business plans, financial projections, and market analysis.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Award className="w-4 h-4" />
                        400 tokens
                      </span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = "/getting-started"}>
                        Start
                      </Button>
                    </div>
                  </div>

                  {/* Grant Writing Simulator */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Scroll className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Grant Writing</h3>
                        <p className="text-sm text-gray-500">8 modules</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Master grant research, proposal writing, and funding strategies for nonprofits.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-purple-600 font-medium">
                        <Award className="w-4 h-4" />
                        450 tokens
                      </span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = "/getting-started"}>
                        Start
                      </Button>
                    </div>
                  </div>

                  {/* Contracts Simulator */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <FileText className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Contracts & Agreements</h3>
                        <p className="text-sm text-gray-500">10 modules</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Learn contract law basics, negotiation tactics, and agreement templates.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <Award className="w-4 h-4" />
                        400 tokens
                      </span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = "/getting-started"}>
                        Start
                      </Button>
                    </div>
                  </div>

                  {/* Insurance Simulator */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-red-100 rounded-xl">
                        <Shield className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Insurance Planning</h3>
                        <p className="text-sm text-gray-500">12 modules</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Understand insurance types, coverage analysis, and risk management strategies.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-red-600 font-medium">
                        <Award className="w-4 h-4" />
                        500 tokens
                      </span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = "/getting-started"}>
                        Start
                      </Button>
                    </div>
                  </div>

                  {/* Blockchain Simulator */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-indigo-100 rounded-xl">
                        <Code className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Blockchain & Web3</h3>
                        <p className="text-sm text-gray-500">10 modules</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Explore blockchain technology, smart contracts, and decentralized finance.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-indigo-600 font-medium">
                        <Award className="w-4 h-4" />
                        550 tokens
                      </span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = "/getting-started"}>
                        Start
                      </Button>
                    </div>
                  </div>

                  {/* DBA & Trademark Simulator */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-teal-100 rounded-xl">
                        <Briefcase className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">DBA & Trademark</h3>
                        <p className="text-sm text-gray-500">6 modules</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Register business names, file trademarks, and protect your brand identity.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-teal-600 font-medium">
                        <Award className="w-4 h-4" />
                        300 tokens
                      </span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = "/getting-started"}>
                        Start
                      </Button>
                    </div>
                  </div>

                  {/* Financial Literacy Simulator */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Financial Literacy</h3>
                        <p className="text-sm text-gray-500">15 modules</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Build budgets, understand investments, and master personal finance fundamentals.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <Award className="w-4 h-4" />
                        600 tokens
                      </span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = "/getting-started"}>
                        Start
                      </Button>
                    </div>
                  </div>

                  {/* Operations Simulator */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <Wrench className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Business Operations</h3>
                        <p className="text-sm text-gray-500">10 modules</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Learn operational management, process optimization, and team coordination.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-orange-600 font-medium">
                        <Award className="w-4 h-4" />
                        400 tokens
                      </span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = "/getting-started"}>
                        Start
                      </Button>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <DepartmentProcedures 
                department="Academy" 
                title="Academy Document Repository"
                description="Curriculum guides, teaching materials, student handbooks, and educational resources"
                showCategories={true}
                showSearch={true}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
