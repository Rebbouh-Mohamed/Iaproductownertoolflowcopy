import React from "react";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Target,
  FileText,
  Settings,
  Users,
  TestTube,
  Calendar,
  GitBranch,
  Download,
  Kanban,
  MapPin,
  Layers
} from "lucide-react";
import { useProject } from "./ProjectContext";
import { useAuth } from "./AuthContext";

const steps = [
  {
    id: 1,
    title: "Product Vision",
    description: "Définir la vision produit",
    icon: Target,
    color: "from-violet-500 to-purple-600",
  },
  {
    id: 2,
    title: "Description Projet",
    description: "Détailler le projet",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 3,
    title: "Fonctionnalités",
    description: "Sélectionner les features",
    icon: Settings,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 4,
    title: "Planification",
    description: "Roadmap, Epics & Stories",
    icon: Calendar,
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: 5,
    title: "Kanban/Sprint",
    description: "Organiser le travail",
    icon: Kanban,
    color: "from-purple-500 to-violet-600",
  },
  {
    id: 6,
    title: "User Flow",
    description: "Concevoir les parcours",
    icon: GitBranch,
    color: "from-teal-500 to-cyan-600",
  },
  {
    id: 7,
    title: "Tests QA",
    description: "Créer les tests",
    icon: TestTube,
    color: "from-rose-500 to-pink-600",
  },
  {
    id: 8,
    title: "Export",
    description: "Finaliser et exporter",
    icon: Download,
    color: "from-green-500 to-emerald-600",
  },
];

export function Navigation() {
  const { state, dispatch } = useProject();
  const { currentProject } = useAuth();

  const goToStep = (step: number) => {
    dispatch({ type: "SET_STEP", payload: step });
  };

  const nextStep = () => {
    if (state.currentStep < 8) {
      dispatch({
        type: "SET_STEP",
        payload: state.currentStep + 1,
      });
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      dispatch({
        type: "SET_STEP",
        payload: state.currentStep - 1,
      });
    }
  };

  const isStepCompleted = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return (
          !!state.productVision.problem &&
          !!state.productVision.persona
        );
      case 2:
        return (
          !!state.projectDescription.mainFeatures &&
          !!state.projectDescription.users
        );
      case 3:
        return state.features.some((f) => f.selected);
      case 4:
        return state.epics.length > 0 || state.userStories.length > 0 || state.roadmapItems.length > 0;
      case 5:
        return (
          state.sprints.length > 0 ||
          state.projectSettings.workMode === "kanban"
        );
      case 6:
        return true; // User flow is always accessible
      case 7:
        return state.testCases.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b shadow-sm">
      {/* App Header */}
      <div className="px-6 py-4 bg-prodigy-primary border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Target className="w-5 h-5 text-prodigy-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Prodigy
              </h1>
              <p className="text-xs text-blue-100 opacity-90">
                Outil IA pour Product Owners
              </p>
            </div>
          </div>
          {currentProject && (
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {currentProject.name}
              </p>
              <p className="text-xs text-blue-100 opacity-75">
                {currentProject.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="flex flex-col items-center flex-1"
              >
                <div className="flex items-center w-full">
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-lg ${
                      state.currentStep === step.id
                        ? `bg-gradient-to-br ${step.color} text-white shadow-xl`
                        : isStepCompleted(step.id)
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg"
                          : "bg-white text-gray-500 hover:text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {isStepCompleted(step.id) &&
                    state.currentStep !== step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                    {state.currentStep === step.id && (
                      <div className="absolute -inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-3 relative">
                      <div className="h-1 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isStepCompleted(step.id)
                              ? "bg-gradient-to-r from-green-500 to-emerald-600"
                              : state.currentStep > step.id
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : "bg-gray-300"
                          }`}
                          style={{
                            width: isStepCompleted(step.id)
                              ? "100%"
                              : state.currentStep > step.id
                                ? "100%"
                                : state.currentStep === step.id
                                  ? "50%"
                                  : "0%",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center mt-3">
                  <p
                    className={`text-sm font-medium ${
                      state.currentStep === step.id
                        ? "text-gray-900"
                        : isStepCompleted(step.id)
                          ? "text-green-700"
                          : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-100 flex justify-between items-center border-t border-gray-100">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={state.currentStep === 1}
          className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-200 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </Button>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Étape {state.currentStep} sur {steps.length}
          </div>
          <div className="flex gap-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  step.id === state.currentStep
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 w-6"
                    : isStepCompleted(step.id)
                      ? "bg-green-500"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={nextStep}
          disabled={state.currentStep === 10}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}