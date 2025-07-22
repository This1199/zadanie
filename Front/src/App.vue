<template>
  <div class="main-layout">
    <div class="app-container">
      <div class="header">
        <h1>Организационная структура</h1>
        <div class="add-form">
          <input 
            type="text" 
            v-model="newDivision.name" 
            placeholder="Название новой службы"
            @keyup.enter="submitDivision"
          >
          <button @click="submitDivision">Добавить службу</button>
        </div>
      </div>
      <div class="tree-container">
        <div v-if="divisionStore.loading">Загрузка данных...</div>
        <div v-else-if="divisionStore.error" class="error">{{ divisionStore.error }}</div>
        <div v-else-if="!divisionStore.divisions.length" class="empty">
          Нет данных для отображения. Добавьте первое подразделение.
        </div>
        <div v-else class="tree">
          <TreeItem 
            v-for="division in divisionStore.divisions" 
            :key="division.id" 
            :item="division"
            @select="handleDivisionSelect"
          />
        </div>
      </div>
    </div>

    
      <PeopleCards 
        v-if="divisionStore.selectedDivision"
        :people="personStore.people"
        :divisionId="divisionStore.selectedDivision.id" 
        :divisionName="divisionStore.selectedDivision.name"
        :loading="personStore.loading"
        :error="personStore.error"
        :level="divisionStore.selectedDivision.level"
      />
   
    <AddDivisionModal
      :visible="showAddRootModal"
      @added="handleAddRootDivision"
      @cancel="showAddRootModal = false"
    />
  </div>
</template>

<script setup>
import PeopleCards from '@/components/PeopleCards.vue'
import { useDivisionStore } from './stores/DivisionStore';
import { ref, onMounted, watch } from 'vue'
import TreeItem from '@/components/TreeItem.vue'
import { usePersonStore } from './stores/PersonStore'

import AddDivisionModal from '@/components/ConfirmModal/AddDivisionModal.vue'



const divisionStore = useDivisionStore()
const showAddRootModal = ref(false)

const handleAddRootDivision = async (divisionData) => {
  try {
    await divisionStore.addDivision({
      ...divisionData,
      level: 'service'
    })
    showAddRootModal.value = false
  } catch (error) {
    alert(error.message)
  }
}

const personStore = usePersonStore()


const newDivision = ref({
  name: '',
  parent: null,
  level: 'service'
})

const selectedDivision = ref(null)

const handleDivisionSelect = async (division) => {
  selectedDivision.value = division
  await personStore.fetchPeopleByDivision(division.id)
}

const submitDivision = async () => {
  if (!newDivision.value.name.trim()) {
    alert('Пожалуйста, введите название службы')
    return
  }
  
  try {
    await divisionStore.addDivision(newDivision.value)
    newDivision.value = { name: '', parent: null, level: 'service' }
  } catch (error) {
    alert(error.message)
  }
}

onMounted(() => {
  divisionStore.fetchDivisions()
  if (divisionStore.divisions.length > 0) {
    divisionStore.setSelectedDivision(divisionStore.divisions[0])
  }
})

watch(() => divisionStore.selectedDivision, async (division) => {
  if (division) {
    await personStore.fetchPeopleByDivision(division.id)
  }
})
</script>

<style scoped>
.main-layout {
  display: flex;
  gap: 20px;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 25%;
  min-height: 100vh;
  flex: 1 1 40%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 20px;
  overflow-y: auto;
}

.people-cards-container {
  flex: 1 1 55%;
  max-width: 75%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 20px;
}


.header {
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0 0 15px 0;
  font-weight: 500;
}

.add-form {
  display: flex;
  gap: 10px;
}

.add-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.add-form button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-form button:hover {
  background-color: #2980b9;
}

.tree-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
}

.empty {
  text-align: center;
  color: #7f8c8d;
  padding: 40px 0;
}

.error {
  color: #e74c3c;
  padding: 20px;
  background: #fdeded;
  border-radius: 4px;
  text-align: center;
}
</style>