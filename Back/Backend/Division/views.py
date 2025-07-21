from rest_framework import viewsets, serializers
from .models import Division, Person
from .serializers import DivisionSerializer, PersonSerializer
from rest_framework.response import Response
from rest_framework import status, viewsets



class DivisionViewSet(viewsets.ModelViewSet):
    serializer_class = DivisionSerializer
    
    def get_queryset(self):
        if self.action == 'list':
            return Division.objects.filter(parent__isnull=True)
        return Division.objects.all()
    
    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            parent_id = data.get('parent')
            
            if parent_id:
                try:
                    parent = Division.objects.get(id=parent_id)
                    level_map = {
                        'service': 'department',
                        'department': 'section',
                        'section': 'group',
                    }
                    data['level'] = level_map.get(parent.level, 'group')
                except Division.DoesNotExist:
                    return Response(
                        {'message': 'Родительское подразделение не найдено'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                data['level'] = 'service'
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except serializers.ValidationError as e:
            return Response(
                {'message': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'message': 'Произошла ошибка при создании подразделения'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    def get_queryset(self):
        division_id = self.request.query_params.get('division')
        if division_id:
            return self.queryset.filter(division_id=division_id)
        return self.queryset.all()
    

