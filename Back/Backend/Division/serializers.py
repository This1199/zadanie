from rest_framework import serializers
from .models import Division, Person

class RecursiveSerializer(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class DivisionSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Division
        fields = ['id', 'name', 'parent', 'level', 'created_at', 'children']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        parent = data.get('parent')
        level = data.get('level', 'service')
        
        if Division.objects.filter(name=data['name'], parent=parent).exists():
            raise serializers.ValidationError(
                {'name': 'Подразделение с таким именем уже существует в этой ветке'}
            )
            
        if parent:
            parent_level = parent.level
            
            valid_hierarchy = {
                'service': 'department',
                'department': 'section',
                'section': 'group',
            }
            
            if valid_hierarchy.get(parent_level) != level:
                raise serializers.ValidationError(
                    {'level': f'Недопустимый уровень: {parent_level} → {level}'}
                )
        else:
            if level != 'service':
                raise serializers.ValidationError(
                    {'level': 'Корневые элементы должны быть службами'}
                )
                
        return data
    
    def get_children(self, obj):
        children = obj.children.all()
        return DivisionSerializer(children, many=True).data
    

class PersonSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Person
        fields = [
            'id', 'first_name', 'last_name', 'middle_name', 
            'position', 'email', 'phone', 'division',
            'birth_date', 'hire_date', 'photo'
        ]