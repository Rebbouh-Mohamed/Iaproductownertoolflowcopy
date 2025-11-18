import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import {
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar, 
  Monitor, 
  Smartphone, 
  Building, 
  Laptop,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import type { Project, ProjectType } from '../../types/project';

const typeIcons = {
  web: Monitor,
  mobile: Smartphone,
  desktop: Laptop,
  enterprise: Building
};

const statusColors: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-800',
  en_cours: 'bg-blue-100 text-blue-800',
  termine: 'bg-green-100 text-green-800',
  archive: 'bg-slate-100 text-slate-800',
  annule: 'bg-red-100 text-red-800',
  en_attente: 'bg-amber-100 text-amber-800'
};

const statusLabels = {
  brouillon: 'Brouillon',
  en_cours: 'En cours',
  termine: 'Terminé',
  archive: 'Archivé',
  annule: 'Annulé',
  en_attente: 'En attente'
};

interface ProjectsPageProps {
  onSelectProject: () => void;
}

export function ProjectsPage({ onSelectProject }: ProjectsPageProps) {
  const {
    user,
    projects,
    logout,
    createProject,
    selectProject,
    deleteProject
  } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'brouillon' as const,
    projectTypeId: undefined as number | undefined,
    startDate: '',
    endDate: ''
  });
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [isTypesLoading, setIsTypesLoading] = useState(false);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadProjectTypes = async () => {
      setIsTypesLoading(true);
      setTypesError(null);
      try {
        const types = await projectService.listProjectTypes();
        if (!isMounted) return;
        setProjectTypes(types);
        setNewProject(prev => ({
          ...prev,
          projectTypeId: prev.projectTypeId ?? types[0]?.id
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des types de projet:', error);
        if (isMounted) {
          setTypesError(
            error instanceof Error
              ? error.message
              : 'Impossible de récupérer les types de projet.'
          );
        }
      } finally {
        if (isMounted) {
          setIsTypesLoading(false);
        }
      }
    };

    void loadProjectTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesType =
        typeFilter === 'all' ||
        (project.projectType?.id && String(project.projectType.id) === typeFilter);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, searchTerm, statusFilter, typeFilter]);

  const handleCreateProject = async () => {
    setCreateError(null);
    if (!newProject.name.trim()) {
      setCreateError('Le nom du projet est obligatoire.');
      return;
    }
    if (!newProject.projectTypeId) {
      setCreateError('Veuillez sélectionner un type de projet.');
      return;
    }

    await createProject({
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      status: newProject.status,
      projectTypeId: newProject.projectTypeId,
      startDate: newProject.startDate || undefined,
      endDate: newProject.endDate || undefined
    });

    setNewProject(prev => ({
      ...prev,
      name: '',
      description: '',
      status: 'brouillon',
      startDate: '',
      endDate: ''
    }));
    setIsCreateDialogOpen(false);
  };

  const handleSelectProject = async (projectId: number | string) => {
    await selectProject(projectId);
    onSelectProject();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-prodigy-primary rounded-lg flex items-center justify-center shadow-sm">
                  <div className="w-4 h-4 bg-white rounded"></div>
                </div>
                <h1 className="text-xl font-bold text-prodigy-primary">
                  Prodigy
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void logout()}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mes Projets</h2>
          <p className="text-gray-600 mt-2">
            Gérez vos projets et créez des documentations complètes avec l'IA
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
                <SelectItem value="archive">Archivé</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
              disabled={isTypesLoading}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {projectTypes.map(type => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau Projet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau projet</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau projet pour commencer votre documentation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du projet</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Ex: Application Mobile E-commerce"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Décrivez brièvement votre projet..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Date de début</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) =>
                          setNewProject({ ...newProject, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Date de fin</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newProject.endDate}
                        onChange={(e) =>
                          setNewProject({ ...newProject, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="type">Type de projet</Label>
                    <Select
                      value={newProject.projectTypeId ? String(newProject.projectTypeId) : undefined}
                      onValueChange={(value: string) =>
                        setNewProject({ ...newProject, projectTypeId: Number(value) })
                      }
                      disabled={isTypesLoading || !!typesError}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map(type => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {typesError && (
                      <p className="text-sm text-red-600 mt-1">{typesError}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={newProject.status}
                      onValueChange={(value: any) =>
                        setNewProject({ ...newProject, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brouillon">Brouillon</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="termine">Terminé</SelectItem>
                        <SelectItem value="archive">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateProject}>
                      Créer le projet
                    </Button>
                  </div>
                  {createError && (
                    <p className="text-sm text-red-600">{createError}</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {typesError && (
          <p className="text-sm text-red-600 mb-4">{typesError}</p>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const typeKey = project.projectType?.name?.toLowerCase();
            const TypeIcon =
              typeKey && typeIcons[typeKey as keyof typeof typeIcons]
                ? typeIcons[typeKey as keyof typeof typeIcons]
                : Monitor;
            const badgeClass = statusColors[project.status] ?? 'bg-gray-100 text-gray-800';
            const badgeLabel = statusLabels[project.status as keyof typeof statusLabels] ?? project.status;
            return (
              <Card 
                key={project.id} 
                className="group hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white/60 backdrop-blur-sm"
                onClick={() => void handleSelectProject(project.id)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                      {TypeIcon ? (
                        <TypeIcon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Monitor className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </CardTitle>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteProject(project.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  {project.projectType?.name && (
                    <p className="text-xs font-medium text-blue-600 mb-1">
                      {project.projectType.name}
                    </p>
                  )}
                  <CardDescription className="mb-4 line-clamp-2">
                    {project.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <Badge className={badgeClass}>
                      {badgeLabel}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      {project.updatedAt
                        ? new Date(project.updatedAt).toLocaleDateString('fr-FR')
                        : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Aucun projet ne correspond à vos critères.'
                : "Vous n'avez pas encore créé de projet."}
            </h3>
            {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer votre premier projet
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}