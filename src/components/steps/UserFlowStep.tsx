import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useProject } from '../ProjectContext';
import { 
  Wand2, GitBranch, ArrowRight, User, Monitor, Smartphone, 
  AlertCircle, Play, Square, Diamond, StopCircle, Users,
  ChevronDown, Download, Zap
} from 'lucide-react';

interface FlowNode {
  id: string;
  title: string;
  type: 'start' | 'process' | 'decision' | 'end';
  description: string;
  connections: string[];
  x: number;
  y: number;
}

interface UserFlow {
  id: string;
  name: string;
  description: string;
  persona: string;
  category: 'main' | 'onboarding' | 'error' | 'conversion';
  nodes: FlowNode[];
  connections: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}

export function UserFlowStep() {
  const { state } = useProject();
  const [userFlows, setUserFlows] = useState<UserFlow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'main' | 'onboarding' | 'error' | 'conversion'>('all');
  const svgRef = useRef<SVGSVGElement>(null);

  const generateUserFlows = () => {
    const flows: UserFlow[] = [];

    // Flow principal basé sur les fonctionnalités sélectionnées
    const mainFeatures = state.features.filter(f => f.selected);
    
    if (mainFeatures.length > 0) {
      const mainFlow: UserFlow = {
        id: 'main-flow',
        name: 'Parcours utilisateur principal',
        description: 'Parcours complet d\'un utilisateur type utilisant les fonctionnalités principales',
        persona: 'Utilisateur expérimenté',
        category: 'main',
        nodes: [
          { id: 'start', title: 'Arrivée', type: 'start', description: 'L\'utilisateur accède à l\'application', connections: ['auth'], x: 100, y: 50 },
          { id: 'auth', title: 'Authentification', type: 'decision', description: 'Vérification des identifiants', connections: ['login', 'dashboard'], x: 300, y: 50 },
          { id: 'login', title: 'Connexion', type: 'process', description: 'Saisie des identifiants', connections: ['dashboard'], x: 300, y: 150 },
          { id: 'dashboard', title: 'Tableau de bord', type: 'process', description: 'Vue d\'ensemble', connections: ['features'], x: 500, y: 100 },
          { id: 'features', title: 'Fonctionnalités', type: 'process', description: 'Utilisation des features', connections: ['success', 'error'], x: 700, y: 100 },
          { id: 'success', title: 'Succès', type: 'end', description: 'Action réussie', connections: [], x: 850, y: 50 },
          { id: 'error', title: 'Erreur', type: 'process', description: 'Gestion d\'erreur', connections: ['dashboard'], x: 850, y: 150 }
        ],
        connections: [
          { from: 'start', to: 'auth' },
          { from: 'auth', to: 'login', label: 'Non connecté' },
          { from: 'auth', to: 'dashboard', label: 'Connecté' },
          { from: 'login', to: 'dashboard' },
          { from: 'dashboard', to: 'features' },
          { from: 'features', to: 'success', label: 'Réussite' },
          { from: 'features', to: 'error', label: 'Échec' },
          { from: 'error', to: 'dashboard' }
        ]
      };
      flows.push(mainFlow);
    }

    // Flow d'onboarding
    const onboardingFlow: UserFlow = {
      id: 'onboarding-flow',
      name: 'Parcours d\'onboarding',
      description: 'Première expérience d\'un nouvel utilisateur',
      persona: 'Nouvel utilisateur',
      category: 'onboarding',
      nodes: [
        { id: 'welcome', title: 'Bienvenue', type: 'start', description: 'Page d\'accueil', connections: ['signup'], x: 100, y: 100 },
        { id: 'signup', title: 'Inscription', type: 'process', description: 'Création de compte', connections: ['profile'], x: 300, y: 100 },
        { id: 'profile', title: 'Profil', type: 'process', description: 'Configuration du profil', connections: ['tutorial'], x: 500, y: 100 },
        { id: 'tutorial', title: 'Tutorial', type: 'process', description: 'Découverte guidée', connections: ['first-action'], x: 700, y: 100 },
        { id: 'first-action', title: 'Première action', type: 'process', description: 'Utilisation d\'une fonctionnalité', connections: ['complete'], x: 900, y: 100 },
        { id: 'complete', title: 'Terminé', type: 'end', description: 'Onboarding terminé', connections: [], x: 1100, y: 100 }
      ],
      connections: [
        { from: 'welcome', to: 'signup' },
        { from: 'signup', to: 'profile' },
        { from: 'profile', to: 'tutorial' },
        { from: 'tutorial', to: 'first-action' },
        { from: 'first-action', to: 'complete' }
      ]
    };
    flows.push(onboardingFlow);

    // Flow de conversion
    const conversionFlow: UserFlow = {
      id: 'conversion-flow',
      name: 'Parcours de conversion',
      description: 'Transformation visiteur en utilisateur actif',
      persona: 'Visiteur potentiel',
      category: 'conversion',
      nodes: [
        { id: 'landing', title: 'Page d\'atterrissage', type: 'start', description: 'Arrivée sur le site', connections: ['interest'], x: 100, y: 100 },
        { id: 'interest', title: 'Intérêt manifesté', type: 'decision', description: 'L\'utilisateur montre de l\'intérêt', connections: ['demo', 'leave'], x: 350, y: 100 },
        { id: 'demo', title: 'Démonstration', type: 'process', description: 'Présentation du produit', connections: ['trial'], x: 600, y: 50 },
        { id: 'trial', title: 'Essai gratuit', type: 'process', description: 'Période d\'essai', connections: ['convert', 'abandon'], x: 850, y: 50 },
        { id: 'convert', title: 'Conversion', type: 'end', description: 'Devient client', connections: [], x: 1100, y: 50 },
        { id: 'abandon', title: 'Abandon', type: 'process', description: 'Relance marketing', connections: ['interest'], x: 850, y: 150 },
        { id: 'leave', title: 'Départ', type: 'end', description: 'Quitte le site', connections: [], x: 600, y: 150 }
      ],
      connections: [
        { from: 'landing', to: 'interest' },
        { from: 'interest', to: 'demo', label: 'Intéressé' },
        { from: 'interest', to: 'leave', label: 'Pas intéressé' },
        { from: 'demo', to: 'trial' },
        { from: 'trial', to: 'convert', label: 'Satisfait' },
        { from: 'trial', to: 'abandon', label: 'Insatisfait' },
        { from: 'abandon', to: 'interest' }
      ]
    };
    flows.push(conversionFlow);

    // Flow de gestion d'erreurs
    const errorFlow: UserFlow = {
      id: 'error-flow',
      name: 'Gestion des erreurs',
      description: 'Parcours de récupération en cas de problème',
      persona: 'Utilisateur en difficulté',
      category: 'error',
      nodes: [
        { id: 'error-trigger', title: 'Erreur détectée', type: 'start', description: 'Problème survenu', connections: ['error-type'], x: 100, y: 100 },
        { id: 'error-type', title: 'Type d\'erreur', type: 'decision', description: 'Classification', connections: ['user-error', 'system-error', 'network-error'], x: 350, y: 100 },
        { id: 'user-error', title: 'Erreur utilisateur', type: 'process', description: 'Message d\'aide', connections: ['retry'], x: 600, y: 50 },
        { id: 'system-error', title: 'Erreur système', type: 'process', description: 'Contact support', connections: ['support'], x: 600, y: 100 },
        { id: 'network-error', title: 'Erreur réseau', type: 'process', description: 'Mode offline', connections: ['retry'], x: 600, y: 150 },
        { id: 'retry', title: 'Nouvelle tentative', type: 'process', description: 'Réessayer', connections: ['resolved'], x: 850, y: 100 },
        { id: 'support', title: 'Support contacté', type: 'process', description: 'Ticket créé', connections: ['resolved'], x: 850, y: 50 },
        { id: 'resolved', title: 'Problème résolu', type: 'end', description: 'Retour normal', connections: [], x: 1100, y: 100 }
      ],
      connections: [
        { from: 'error-trigger', to: 'error-type' },
        { from: 'error-type', to: 'user-error', label: 'Utilisateur' },
        { from: 'error-type', to: 'system-error', label: 'Système' },
        { from: 'error-type', to: 'network-error', label: 'Réseau' },
        { from: 'user-error', to: 'retry' },
        { from: 'system-error', to: 'support' },
        { from: 'network-error', to: 'retry' },
        { from: 'retry', to: 'resolved' },
        { from: 'support', to: 'resolved' }
      ]
    };
    flows.push(errorFlow);

    setUserFlows(flows);
    setSelectedFlow(flows[0]?.id || null);
  };

  const getNodeIcon = (type: FlowNode['type']) => {
    switch (type) {
      case 'start':
        return <Play className="w-4 h-4 text-green-600" />;
      case 'process':
        return <Square className="w-4 h-4 text-blue-600" />;
      case 'decision':
        return <Diamond className="w-4 h-4 text-yellow-600" />;
      case 'end':
        return <StopCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Square className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNodeStyle = (type: FlowNode['type']) => {
    const baseStyle = "absolute border-2 rounded-lg p-4 bg-white shadow-lg transition-all hover:shadow-xl min-w-[180px]";
    switch (type) {
      case 'start':
        return `${baseStyle} border-green-500 bg-gradient-to-br from-green-50 to-emerald-100`;
      case 'process':
        return `${baseStyle} border-blue-500 bg-gradient-to-br from-blue-50 to-sky-100`;
      case 'decision':
        return `${baseStyle} border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-100 transform rotate-45`;
      case 'end':
        return `${baseStyle} border-red-500 bg-gradient-to-br from-red-50 to-pink-100`;
      default:
        return `${baseStyle} border-gray-500 bg-gradient-to-br from-gray-50 to-slate-100`;
    }
  };

  const getCategoryColor = (category: UserFlow['category']) => {
    switch (category) {
      case 'main':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'onboarding':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'conversion':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: UserFlow['category']) => {
    switch (category) {
      case 'main':
        return <Users className="w-4 h-4" />;
      case 'onboarding':
        return <User className="w-4 h-4" />;
      case 'conversion':
        return <Zap className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <GitBranch className="w-4 h-4" />;
    }
  };

  const filteredFlows = selectedCategory === 'all' 
    ? userFlows 
    : userFlows.filter(flow => flow.category === selectedCategory);

  const selectedFlowData = userFlows.find(f => f.id === selectedFlow);

  // Génération des connexions SVG
  const generatePath = (from: FlowNode, to: FlowNode) => {
    const startX = from.x + 90; // Centre du noeud
    const startY = from.y + 30;
    const endX = to.x + 90;
    const endY = to.y + 30;
    
    // Courbe de Bézier pour un rendu plus fluide
    const midX = (startX + endX) / 2;
    const controlX1 = startX + (midX - startX) * 0.5;
    const controlX2 = endX - (endX - midX) * 0.5;
    
    return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Génération de User Flow
        </h1>
        <p className="text-muted-foreground">
          Visualisez les parcours utilisateurs avec des diagrammes interactifs et professionnels
        </p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {userFlows.length} parcours générés
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Catégorie :</span>
            <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="main">Principal</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="error">Erreurs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={generateUserFlows} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Wand2 className="w-4 h-4" />
          Générer les User Flows
        </Button>
      </div>

      {userFlows.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Aucun parcours utilisateur généré pour le moment.</p>
              <p className="text-sm">
                Créez des flows interactifs basés sur vos {state.features.filter(f => f.selected).length} fonctionnalités sélectionnées.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Sélecteur de flow avec cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFlows.map(flow => (
              <Card 
                key={flow.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedFlow === flow.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedFlow(flow.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(flow.category)}
                    <Badge className={`text-xs ${getCategoryColor(flow.category)}`}>
                      {flow.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm">{flow.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {flow.persona}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{flow.nodes.length} étapes</span>
                    <span>{flow.connections.length} connexions</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Diagramme de flow sélectionné */}
          {selectedFlowData && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(selectedFlowData.category)}
                    {selectedFlowData.name}
                    <Badge className={`text-xs ${getCategoryColor(selectedFlowData.category)}`}>
                      {selectedFlowData.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    <strong>Persona :</strong> {selectedFlowData.persona}
                    <br />
                    {selectedFlowData.description}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Diagramme visuel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Diagramme de flux interactif</span>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exporter SVG
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Visualisation des étapes et des connexions du parcours utilisateur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg p-8 overflow-auto">
                    <div className="relative min-h-[400px] min-w-[1200px]">
                      {/* SVG pour les connexions */}
                      <svg
                        ref={svgRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ zIndex: 1 }}
                      >
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="10"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              fill="#6b7280"
                            />
                          </marker>
                        </defs>
                        {selectedFlowData.connections.map((connection, index) => {
                          const fromNode = selectedFlowData.nodes.find(n => n.id === connection.from);
                          const toNode = selectedFlowData.nodes.find(n => n.id === connection.to);
                          
                          if (!fromNode || !toNode) return null;
                          
                          return (
                            <g key={index}>
                              <path
                                d={generatePath(fromNode, toNode)}
                                stroke="#6b7280"
                                strokeWidth="2"
                                fill="none"
                                markerEnd="url(#arrowhead)"
                                className="drop-shadow-sm"
                              />
                              {connection.label && (
                                <text
                                  x={(fromNode.x + toNode.x) / 2 + 90}
                                  y={(fromNode.y + toNode.y) / 2 + 20}
                                  textAnchor="middle"
                                  className="text-xs fill-gray-600 bg-white"
                                  style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: '3px' }}
                                >
                                  {connection.label}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>

                      {/* Nœuds du flow */}
                      {selectedFlowData.nodes.map((node) => (
                        <div
                          key={node.id}
                          className={`${getNodeStyle(node.type)} ${node.type === 'decision' ? 'transform rotate-45' : ''}`}
                          style={{
                            left: `${node.x}px`,
                            top: `${node.y}px`,
                            zIndex: 10
                          }}
                        >
                          <div className={`${node.type === 'decision' ? 'transform -rotate-45' : ''}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {getNodeIcon(node.type)}
                              <span className="font-medium text-sm">{node.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {node.description}
                            </p>
                            {node.connections.length > 0 && (
                              <Badge variant="outline" className="text-xs mt-2">
                                {node.connections.length} sorties
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Légende et statistiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Légende des éléments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Point de départ</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Square className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Processus/Action</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Diamond className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm">Point de décision</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StopCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm">Point d'arrivée</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiques du parcours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Étapes totales</span>
                        <Badge variant="secondary">{selectedFlowData.nodes.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Points de décision</span>
                        <Badge variant="secondary">
                          {selectedFlowData.nodes.filter(n => n.type === 'decision').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Connexions</span>
                        <Badge variant="secondary">{selectedFlowData.connections.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Complexité</span>
                        <Badge variant="outline">
                          {selectedFlowData.nodes.length > 8 ? 'Élevée' : 
                           selectedFlowData.nodes.length > 5 ? 'Moyenne' : 'Simple'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}