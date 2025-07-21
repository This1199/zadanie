from django.db import models

class Division(models.Model):
    LEVEL_CHOICES = [
        ('service', 'Служба'),
        ('department', 'Управление'),
        ('section', 'Отдел'),
        ('group', 'Группа'),
    ]
    
    name = models.CharField(max_length=50)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children'
    )
    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default='service'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'parent'], 
                name='unique_division_name_per_parent'
            )
        ]
    
class Person(models.Model):
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name='people')
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True) 
    position = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True) 
    hire_date = models.DateField(blank=True, null=True) 
    photo = models.ImageField(
        upload_to='people_photos/', 
        blank=True, 
        null=True,
        verbose_name='Фотография'
    )
    def __str__(self):
        return f"{self.first_name} {self.last_name}"