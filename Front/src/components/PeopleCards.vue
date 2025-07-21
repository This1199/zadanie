<template>
  <div class="people-container" v-if="people && people.length">
    <div class="stats-container">
      <h2>Статистика подразделения:{{ `\"${levelName[level]} ${divisionName}\"`}}</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Количество сотрудников:</span>
          <span class="stat-value">{{ employeeCount }} {{ pluralize(employeeCount, ['сотрудник', 'сотрудника', 'сотрудников']) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Средний возраст:</span>
          <span class="stat-value">{{ averageAge }} {{ pluralize(Math.round(averageAge), ['год', 'года', 'лет']) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Средний стаж:</span>
          <span class="stat-value">{{ averageExperience }} {{ pluralize(Math.round(averageExperience), ['год', 'года', 'лет']) }}</span>
        </div>
      </div>
    </div>
    <div class="TopInterface">
      <h2>Сотрудники подразделения: {{ `\"${levelName[level]} ${divisionName}\"`}}</h2>
      <button @click="openAddModal">Добавить сотрудника</button>
    </div>
    <div v-for="person in people" :key="person.id" class="person-card">
      <div class="photo">
        <img v-if="person.photo" :src="getPhotoUrl(person.photo)" alt="Фото сотрудника">
        <div v-else class="no-photo">Нет фото</div>
      </div>
      <div class="description">
        <h3>{{ person.last_name }} {{ person.first_name }} {{ person.middle_name }}</h3>
        <p><strong>Должность:</strong> {{ person.position || 'Не указана' }}</p>
        <p v-if="person.email"><strong>Email:</strong> {{ person.email }}</p>
        <p v-if="person.phone"><strong>Телефон:</strong> {{ person.phone }}</p>
        <!-- Добавлено -->
        <p v-if="person.birth_date"><strong>Дата рождения:</strong> {{ formatDate(person.birth_date) }}</p>
        <p v-if="person.hire_date"><strong>Дата приема:</strong> {{ formatDate(person.hire_date) }}</p>
      </div>
        <div class="Buttons">
            <button 
            @click="openEditModal(person)"
            >Редактировать пользователя
            </button>
            <button 
          style="background-color: red;"
          @click="openDeleteModal(person)"
        >Удалить пользователя
            </button>
      </div>
    </div>
  </div>
  <div v-else-if="loading">Загрузка сотрудников...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="empty-division">
        <div class="TopInterface">
          <h2>В подразделении {{ `\"${levelName[level]} ${divisionName}\"`}} нет сотрудников</h2>
          <button @click="openAddModal">Добавить сотрудника</button>
        </div>
      </div>
    <ConfirmModalDelete
      :visible="showDeleteModal"
      title="Удаление пользователя"
      :message="`Вы уверены, что хотите удалить пользователя ${personToDelete?.last_name || ''} ${personToDelete?.first_name || ''}?`"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />
     <AddPersonModal
      :visible="showAddModal"
      :divisionId="divisionId"
      @added="handleAddPerson"
      @cancel="showAddModal = false"
    />
     <EditPersonModal
      :visible="showEditModal"
      :person="personToEdit"
      @updated="handleUpdatePerson"
      @cancel="handleCancelEdit"
    />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePersonStore } from '@/stores/PersonStore'
import ConfirmModalDelete from '@/components/ConfirmModal/ConfirmModalDelete.vue'
import AddPersonModal from '@/components/ConfirmModal/AddPersonModal.vue'
import EditPersonModal from './ConfirmModal/EditPersonModal.vue'

const props = defineProps({
  people: Array,
  divisionName: String,
  divisionId: Number,
  loading: Boolean,
  error: String,
  level: String
})

const levelName = ref({
    'service': 'Служба',
    'department': 'Управление',
    'section': 'Отдел',
    'group': 'Группа'
  })

const photoTimestamps = ref({}); 

const showDeleteModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)

const personToEdit = ref(null)
const personToDelete = ref(null)

const personStore = usePersonStore()
const employeeCount = computed(() => props.people.length)

const openAddModal = () => {
  showAddModal.value = true
}

const openEditModal = (person) => {
  personToEdit.value = person
  showEditModal.value = true
}

const openDeleteModal = (person) => {
  personToDelete.value = person
  showDeleteModal.value = true
}

const handleAddPerson = async (newPersonData) => {
  showAddModal.value = false
  
  try {
    newPersonData.division = props.divisionId
    await personStore.addPerson(newPersonData)
    await personStore.fetchPeopleByDivision(props.divisionId)
  } catch (error) {
    alert(error.message || 'Ошибка при добавлении пользователя')
  }
}

const handleUpdatePerson = async (updatedPersonData) => {
  showEditModal.value = false;
  try {
    const id = updatedPersonData.get('id');
    
    if (!id) {
      throw new Error('ID пользователя не найден');
    }
    photoTimestamps.value[id] = Date.now();
    await personStore.editPerson(id, updatedPersonData);
    await personStore.fetchPeopleByDivision(props.divisionId);
  } catch (error) {
    alert(error.message || 'Ошибка при обновлении пользователя');
  }
  personToEdit.value = null;
}

const handleCancelEdit = () => {
  showEditModal.value = false
  personToEdit.value = null
}

const handleConfirmDelete = async () => {
  showDeleteModal.value = false
  if (!personToDelete.value) return
  try {
    await personStore.deletePerson(personToDelete.value.id)
    await personStore.fetchPeopleByDivision(props.divisionId)
  } catch (error) {
    alert(error.message || 'Ошибка при удалении пользователя')
  }
  personToDelete.value = null
}

const handleCancelDelete = () => {
  showDeleteModal.value = false
  personToDelete.value = null
}

const getPhotoUrl = (photoPath, personId) => {
  if (!photoPath) return '';
  
  let url;
  if (photoPath.startsWith('http')) {
    url = photoPath;
  } else {
    url = `http://localhost:8000${photoPath}`;
  }
  if (photoTimestamps.value[personId]) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}t=${photoTimestamps.value[personId]}`;
  }
  return url;
}

const pluralize = (number, words) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[
    (number % 100 > 4 && number % 100 < 20)
      ? 2 
      : cases[(number % 10 < 5) ? number % 10 : 5]
  ];
}

const averageAge = computed(() => {
  if (!props.people.length) return 0
  
  const today = new Date()
  const ages = props.people.map(person => {
    if (!person.birth_date) return 0
    const birthDate = new Date(person.birth_date)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }).filter(age => age > 0)
  
  if (!ages.length) return 0
  const avg = ages.reduce((a, b) => a + b, 0) / ages.length
  return Math.round(avg * 10) / 10
})

const averageExperience = computed(() => {
  if (!props.people.length) return 0
  
  const today = new Date()
  const experiences = props.people.map(person => {
    if (!person.hire_date) return 0
    const hireDate = new Date(person.hire_date)
    let experience = today.getFullYear() - hireDate.getFullYear()
    const monthDiff = today.getMonth() - hireDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDate.getDate())) {
      experience--
    }
    return experience
  }).filter(exp => exp > 0)
  
  if (!experiences.length) return 0
  const avg = experiences.reduce((a, b) => a + b, 0) / experiences.length
  return Math.round(avg * 10) / 10
})

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}


watch (() => {
    console.log(props.people)
}) 

</script>


<style scoped>

.stats-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  background: white;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.2em;
  font-weight: bold;
  color: #2c3e50;
}

.photo {
  width: 150px;
  height: 200px;
  overflow: hidden;
  border-radius: 6px;
  padding: 0;
  margin-bottom: 12px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.people-container {
  flex: 1 1 55%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
}

.empty-division {
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.TopInterface {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  width: 100%;
}

.TopInterface h2 {
  margin: 0;
  flex: 1;
  min-width: 300px;
}

.TopInterface button {
  margin-left: 0;
  white-space: nowrap;
}

.description {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 12px;
  background-color: #fafafa;
  width: 75%;
  margin-left: 10px;
  margin-right: 10px;
}

.people-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  min-width: 75vh;
  overflow-y: auto;
}

.person-card {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 12px;
  background-color: #fafafa;
  display: flex;
}

.error {
  color: #e74c3c;
  padding: 20px;
  background: #fdeded;
  border-radius: 4px;
  text-align: center;
}

.Buttons {
  width: 10%;
  min-width: 130px;
  margin-left: auto;
}

 button {
  min-height: 50px;
  margin-bottom: 10px;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}
</style>
