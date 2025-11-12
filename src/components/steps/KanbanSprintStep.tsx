import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useProject, Sprint } from '../ProjectContext';
import { 
  Kanban, Calendar, Users, Clock, Play, Pause, CheckCircle, 
  Settings, Plus, BarChart3, TrendingUp, Target, Zap
} from 'lucide-react';

export function KanbanSprintStep() {
  const { state, dispatch } = useProject();
  const [showSettings, setShowSettings] = useState(false);
  const [newSprintData, setNewSprintData] = useState({
    name: '',
    duration: state.projectSettings.sprintDuration
  });

  const generateSprints = () => {
    if (state.userStories.length === 0) return;

    const sortedStories = [...state.userStories].sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const sprints: Sprint[] = [];
    let currentVelocity = 0;
    let currentStories: string[] = [];
    let sprintNumber = 1;

    const today = new Date();

    for (const story of sortedStories) {
      if (currentVelocity + story.estimatedEffort <= state.projectSettings.teamVelocity) {
        currentVelocity += story.estimatedEffort;
        currentStories.push(story.id);
      } else {
        // Créer le sprint actuel
        if (currentStories.length > 0) {
          const startDate = new Date(today);
          startDate.setDate(startDate.getDate() + ((sprintNumber - 1) * state.projectSettings.sprintDuration * 7));
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + (state.projectSettings.sprintDuration * 7));

          sprints.push({
            id: `sprint-${sprintNumber}`,
            name: `Sprint ${sprintNumber}`,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            userStories: [...currentStories],
            velocity: currentVelocity,
            status: sprintNumber === 1 ? 'active' : 'planned'
          });

          sprintNumber++;
          currentVelocity = story.estimatedEffort;
          currentStories = [story.id];
        }
      }
    }

    // Ajouter le dernier sprint s'il reste des stories
    if (currentStories.length > 0) {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + ((sprintNumber - 1) * state.projectSettings.sprintDuration * 7));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (state.projectSettings.sprintDuration * 7));

      sprints.push({
        id: `sprint-${sprintNumber}`,
        name: `Sprint ${sprintNumber}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        userStories: currentStories,
        velocity: currentVelocity,
        status: sprintNumber === 1 ? 'active' : 'planned'
      });
    }

    dispatch({ type: 'SET_SPRINTS', payload: sprints });
  };

  const updateWorkMode = (mode: 'kanban' | 'sprint') => {
    dispatch({
      type: 'SET_PROJECT_SETTINGS',
      payload: { ...state.projectSettings, workMode: mode }
    });
  };

  const updateVelocity = (velocity: number) => {
    dispatch({
      type: 'SET_PROJECT_SETTINGS',
      payload: { ...state.projectSettings, teamVelocity: velocity }
    });
  };

  const updateSprintDuration = (duration: number) => {
    dispatch({
      type: 'SET_PROJECT_SETTINGS',
      payload: { ...state.projectSettings, sprintDuration: duration }
    });
  };

  const createSprint = () => {
    const unassignedStories = state.userStories.filter(story => 
      !state.sprints.some(sprint => sprint.userStories.includes(story.id))
    );

    if (unassignedStories.length === 0) return;

    let selectedStories: string[] = [];
    let totalVelocity = 0;

    // Prendre les stories selon la vélocité de l'équipe
    for (const story of unassignedStories) {
      if (totalVelocity + story.estimatedEffort <= state.projectSettings.teamVelocity) {
        selectedStories.push(story.id);
        totalVelocity += story.estimatedEffort;
      }
    }

    const sprintNumber = state.sprints.length + 1;
    const lastSprint = state.sprints[state.sprints.length - 1];
    const startDate = lastSprint 
      ? new Date(new Date(lastSprint.endDate).getTime() + 24 * 60 * 60 * 1000)
      : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (newSprintData.duration * 7));

    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      name: newSprintData.name || `Sprint ${sprintNumber}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      userStories: selectedStories,
      velocity: totalVelocity,
      status: 'planned'
    };

    dispatch({ type: 'ADD_SPRINT', payload: newSprint });
    setNewSprintData({ name: '', duration: state.projectSettings.sprintDuration });
  };

  const getStatusColor = (status: Sprint['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: Sprint['status']) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'planned':
        return <Clock className="w-4 h-4" />;
      default:
        return <Pause className="w-4 h-4" />;
    }
  };

  const totalStoryPoints = state.userStories.reduce((sum, story) => sum + story.estimatedEffort, 0);
  const assignedStoryPoints = state.sprints.reduce((sum, sprint) => sum + sprint.velocity, 0);
  const estimatedSprints = Math.ceil(totalStoryPoints / state.projectSettings.teamVelocity);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Organisation Kanban & Sprint
        </h1>
        <p className="text-muted-foreground">
          Organisez votre travail en mode Kanban ou Sprint selon votre méthodologie agile
        </p>
      </div>

      {/* Configuration du mode de travail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration de l'équipe
          </CardTitle>
          <CardDescription>
            Définissez votre mode de travail et vos paramètres d'équipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-medium">Mode de travail</Label>
              <Select 
                value={state.projectSettings.workMode} 
                onValueChange={(value: 'kanban' | 'sprint') => updateWorkMode(value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">
                    <div className="flex items-center gap-2">
                      <Kanban className="w-4 h-4" />
                      Kanban
                    </div>
                  </SelectItem>
                  <SelectItem value="sprint">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Sprint
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Vélocité de l'équipe</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  value={state.projectSettings.teamVelocity}
                  onChange={(e) => updateVelocity(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">points/sprint</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Durée du sprint</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  value={state.projectSettings.sprintDuration}
                  onChange={(e) => updateSprintDuration(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">semaines</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={generateSprints} className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Générer les sprints automatiquement
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Créer un sprint manuel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau sprint</DialogTitle>
                  <DialogDescription>
                    Créez un sprint personnalisé avec les stories non assignées
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom du sprint</Label>
                    <Input
                      value={newSprintData.name}
                      onChange={(e) => setNewSprintData({ ...newSprintData, name: e.target.value })}
                      placeholder="Sprint 1"
                    />
                  </div>
                  <div>
                    <Label>Durée (semaines)</Label>
                    <Input
                      type="number"
                      value={newSprintData.duration}
                      onChange={(e) => setNewSprintData({ ...newSprintData, duration: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={createSprint} className="w-full">
                    Créer le sprint
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalStoryPoints}</p>
                <p className="text-sm text-muted-foreground">Story points total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{state.projectSettings.teamVelocity}</p>
                <p className="text-sm text-muted-foreground">Vélocité équipe</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{estimatedSprints}</p>
                <p className="text-sm text-muted-foreground">Sprints estimés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{state.sprints.length}</p>
                <p className="text-sm text-muted-foreground">Sprints créés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal selon le mode */}
      <Tabs value={state.projectSettings.workMode} onValueChange={(value: string) => updateWorkMode(value as 'kanban' | 'sprint')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="w-4 h-4" />
            Vue Kanban
          </TabsTrigger>
          <TabsTrigger value="sprint" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Vue Sprint
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tableau Kanban</CardTitle>
              <CardDescription>
                Visualisez et gérez vos user stories en flux continu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Colonnes Kanban */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm bg-gray-100 p-2 rounded">À faire</h3>
                  <div className="space-y-2 min-h-[200px]">
                    {state.userStories
                      .filter(story => !state.sprints.some(sprint => sprint.userStories.includes(story.id)))
                      .map(story => (
                        <Card key={story.id} className="p-3 cursor-move hover:shadow-md transition-shadow">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {story.estimatedEffort}pts
                              </Badge>
                              <Badge className={`text-xs ${
                                story.priority === 'High' ? 'bg-red-100 text-red-800' :
                                story.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {story.priority}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{story.title}</p>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm bg-blue-100 p-2 rounded">En cours</h3>
                  <div className="space-y-2 min-h-[200px]">
                    {/* User stories en cours */}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm bg-yellow-100 p-2 rounded">En review</h3>
                  <div className="space-y-2 min-h-[200px]">
                    {/* User stories en review */}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm bg-green-100 p-2 rounded">Terminé</h3>
                  <div className="space-y-2 min-h-[200px]">
                    {/* User stories terminées */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sprint" className="space-y-6">
          {state.sprints.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucun sprint créé pour le moment.</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Générez automatiquement des sprints basés sur votre vélocité ou créez-les manuellement.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {state.sprints.map((sprint, index) => (
                <Card key={sprint.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(sprint.status)}
                          {sprint.name}
                        </CardTitle>
                        <Badge className={getStatusColor(sprint.status)}>
                          {sprint.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {sprint.velocity} points
                        </Badge>
                        <Badge variant="secondary">
                          {sprint.userStories.length} stories
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {new Date(sprint.startDate).toLocaleDateString('fr-FR')} - {new Date(sprint.endDate).toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">User Stories assignées :</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sprint.userStories.map(storyId => {
                          const story = state.userStories.find(s => s.id === storyId);
                          return story ? (
                            <div key={storyId} className="flex items-center gap-2 p-3 bg-muted/30 rounded">
                              <Badge variant="outline" className="text-xs">
                                {story.estimatedEffort}pt
                              </Badge>
                              <span className="flex-1 text-sm">{story.title}</span>
                              <Badge className={`text-xs ${
                                story.priority === 'High' ? 'bg-red-100 text-red-800' :
                                story.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {story.priority}
                              </Badge>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}