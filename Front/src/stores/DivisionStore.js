import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useDivisionStore = defineStore('divisions', () => {
  const divisions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const idOpen = ref([])
  const SelectedProps = ref()

  const selectedDivision = ref(null)

  const currentOpenContextMenuId = ref(null)

  const openContextMenu = (id) => {
    currentOpenContextMenuId.value = id
  }
  
  const closeContextMenu = () => {
    currentOpenContextMenuId.value = null
  }

  const fetchDivisions = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get('http://localhost:8000/api/divisions/')
      divisions.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Ошибка загрузки подразделений'
    } finally {
      loading.value = false
    }
  }

  const addDivision = async (divisionData) => {
    try {
      if (divisionData.parent) {
        const parent = findDivisionById(divisionData.parent);
        if (parent && parent.level === 'group') {
          throw new Error('Нельзя создавать дочерние элементы для групп');
        }
      }

      const response = await axios.post('http://localhost:8000/api/divisions/', divisionData);
      
      if (!divisionData.parent) {
        divisions.value.push(response.data);
      } else {
        const parent = findParent(divisionData.parent, divisions.value);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(response.data);
          if (!idOpen.value.includes(divisionData.parent)) {
            idOpen.value.push(divisionData.parent);
          }
        }
      }

      return response.data;
    } catch (err) {
      throw new Error('Ошибка при создании подразделения: данное подразделение уже существует');
    }
  }

  const editDivision = async (id, updateData) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.patch(`http://localhost:8000/api/divisions/${id}/`, updateData)
      const division = findDivisionById(id)
      if (division) {
        Object.assign(division, response.data)
      }
      editIdOpen(id)
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Ошибка при обновлении')
    } finally {
      loading.value = false
    }
  }

  const deleteDivision = async (divisionDataID) => {
    try {
    await axios.delete(`http://localhost:8000/api/divisions/${divisionDataID}/`)
    removeDivisionFromTree(divisionDataID, divisions.value)
    editIdOpen(divisionDataID)
    return true
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Ошибка при удалении')
    }
  }

  const setSelectedDivision = (division) => {
    selectedDivision.value = division
  }

  const removeDivisionFromTree = (id, items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        items.splice(i, 1)
        return true
      }
      if (items[i].children && items[i].children.length) {
        const removed = removeDivisionFromTree(id, items[i].children)
        if (removed) return true
      }
    }
    return false  
  }

  const editIdOpen = (id) => {
    const index = idOpen.value.indexOf(id)
    if (index === -1) {
      idOpen.value.push(id)
    } else {
      idOpen.value.splice(index, 1)
    }
  }

  const findParent = (parentId, items) => {
    for (const item of items) {
      if (item.id === parentId) return item
      if (item.children) {
        const found = findParent(parentId, item.children)
        if (found) return found
      }
    }
    return null
  }

  const findDivisionById = (id, items = divisions.value) => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findDivisionById(id, item.children)
        if (found) return found
      }
    }
    return null
  }

  return { divisions, loading, error, SelectedProps,selectedDivision, idOpen, currentOpenContextMenuId,
    openContextMenu, closeContextMenu, setSelectedDivision, fetchDivisions, addDivision, findDivisionById, deleteDivision, editDivision, editIdOpen }
})

