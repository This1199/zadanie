import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const usePersonStore = defineStore('people', () => {
  const people = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchPeopleByDivision = async (divisionId) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('http://localhost:8000/api/people/', {
        params: { division: divisionId }
      })
      people.value = response.data.map(person => ({
        ...person,
        photo: person.photo ? `${person.photo}` : null
      }))
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Ошибка загрузки людей'
    } finally {
      loading.value = false
    }
  }

  const addPerson = async (personData) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(
        'http://localhost:8000/api/people/', 
        personData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Ошибка добавления пользователя'
    } finally {
      loading.value = false
    }
  }

  const deletePerson = async (divisionDataID) => {
    error.value = null

    try {
    await axios.delete(`http://localhost:8000/api/people/${divisionDataID}/`)
    return true
    } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Ошибка при удалении'
    }
  }

  const editPerson = async (id, updateData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/people/${id}/`, 
        updateData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      const index = people.value.findIndex(p => p.id === id);
      if (index !== -1) {
        people.value[index].photo = response.data.photo;
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Ошибка при удалении'
    } finally {
      loading.value = false;
    }
  }



  return { people, loading, error, fetchPeopleByDivision, editPerson, deletePerson, addPerson }
})
