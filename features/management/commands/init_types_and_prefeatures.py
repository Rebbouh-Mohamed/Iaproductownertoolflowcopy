from django.core.management.base import BaseCommand
from projects.models import ProjectType
from features.models import PreFeature

class Command(BaseCommand):
    help = 'Initialize default ProjectTypes and their related PreFeatures (one-time setup)'

    def handle(self, *args, **options):
        # Define default types and their pre-features (customize/add more from Figma)
        type_data = {
            'web': [
                ('Authentication automatique', 'Système sécurisé pour login et authorisation.', 'Sécurité'),
                ('Tableau de bord d\'interface', 'Visualisation graphique des KPIs.', 'UI'),
                ('Gestion avancée des utilisateurs', 'Module pour créer et gérer des profils.', 'Utilisateurs'),
                # Add more...
            ],
            'mobile': [
                ('Notifications push', 'Envoi de alerts en temps réel.', 'Mobile'),
                # Add more...
            ],
            'desktop': [
                ('Intégration offline', 'Fonctionne sans connexion internet.', 'Desktop'),
                # Add more...
            ],
            # Add other types as needed
        }

        created_types = 0
        created_pre_features = 0

        for type_name, pre_features in type_data.items():
            project_type, type_created = ProjectType.objects.get_or_create(name=type_name)
            if type_created:
                created_types += 1

            for title, desc, cat in pre_features:
                pre_feature, pre_created = PreFeature.objects.get_or_create(
                    title=title,
                    description=desc,
                    category=cat
                )
                if pre_created:
                    created_pre_features += 1
                project_type.pre_features.add(pre_feature)  # Link via ManyToMany

        self.stdout.write(self.style.SUCCESS(f'Created {created_types} new ProjectTypes and {created_pre_features} new PreFeatures. All linked successfully.'))