<template>
  <div class="tree-item" v-if="!deleting">
    <div 
      class="tree-item-content"
      @mouseover="MouseOver = true" 
      @mouseleave="MouseOver = false"
    >
      <span class="toggle-icon" @click.stop="toggle" v-if="hasChildren">      
        <span v-if="isOpen">▼</span>
        <span v-else>▶</span>
      </span>
      <span class="level-badge">{{ levelName }}</span>
      <span class="tree-item-name" @click="selectDivision">{{ item.name }}</span>
      <transition name="fade">
        <button 
          v-show="MouseOver" 
          class="ButtonContest" 
          @click.stop="openContextMenu"
        >...</button>
      </transition>
    </div>
    <div v-show="isOpen && hasChildren" class="children">
      <TreeItem 
        v-for="child in item.children" 
        :key="child.id" 
        :item="child"
        />      
    </div>
    <div 
      v-if="showContextMenu" 
      class="context-menu" 
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <div 
        class="menu-item" 
        v-if="item.level !== 'group'"
        @click="openAddModal"
      >
        Добавить {{ nextLevelName }}
      </div>
      <div class="menu-item" @click="openEditModal">Редактировать</div>
      <div class="menu-item delete" @click="openDeleteModal(item)">Удалить</div>
    </div>

    <AddDivisionModal
      :visible="showAddModal"
      :parentLevel="item.level"
      @added="handleAddDivision"
      @cancel="showAddModal = false"
    />
    
    <EditDivisionModal
      :visible="showEditModal"
      :division="item"
      @updated="handleEditDivision"
      @cancel="showEditModal = false"
    />

    <ConfirmModalDelete
      :visible="showDeleteModal"
      title="Удаление подразделения"
      :message="`Вы уверены, что хотите удалить подразделение ${divisionToDelete?.name || ''}?`"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDivisionStore } from '@/stores/DivisionStore'
import { storeToRefs } from 'pinia'
import ConfirmModalDelete from './ConfirmModal/ConfirmModalDelete.vue'
import EditDivisionModal from '@/components/ConfirmModal/EditDivisionModal.vue'
import AddDivisionModal from '@/components/ConfirmModal/AddDivisionModal.vue'

const divisionStore = useDivisionStore()
const { idOpen, currentOpenContextMenuId } = storeToRefs(divisionStore)

const props = defineProps({
  item: Object
})

const emit = defineEmits(['add-child', 'select-division'])

const MouseOver = ref(false)


const contextMenuX = ref(0)
const contextMenuY = ref(0)
const deleting = ref(false)

const isOpen = computed(() => idOpen.value.includes(props.item.id))

const showDeleteModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)

const divisionToDelete = ref(null)

const levelName = computed(() => {
  return {
    'service': 'Служба',
    'department': 'Управление',
    'section': 'Отдел',
    'group': 'Группа'
  }[props.item.level]
})

const nextLevelName = computed(() => {
  return {
    'service': 'Управление',
    'department': 'Отдел',
    'section': 'Группу'
  }[props.item.level]
})

const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

const openAddModal = () => {
  showAddModal.value = true
  showContextMenu.value = false
}

const openEditModal = () => {
  showEditModal.value = true
  showContextMenu.value = false
}

const openDeleteModal = (item) => {
  divisionToDelete.value = item
  showDeleteModal.value = true
}

const handleConfirmDelete = async () => {
  try {
    await divisionStore.deleteDivision(props.item.id)
    showDeleteModal.value = false
  } catch (error) {
    alert(error.message)
  }
}

const handleCancelDelete = () => {
  showDeleteModal.value = false
  divisionToDelete.value = null
}

const handleAddDivision = async (divisionData) => {
  try {
    const nextLevel = {
      'service': 'department',
      'department': 'section',
      'section': 'group'
    }[props.item.level]
    
    await divisionStore.addDivision({
      ...divisionData,
      parent: props.item.id,
      level: nextLevel 
    })
    showAddModal.value = false
  } catch (error) {
    alert(error.message)
  }
}

const handleEditDivision = async (divisionData) => {
  try {
    await divisionStore.editDivision(divisionData.id, divisionData)
    showEditModal.value = false
  } catch (error) {
    alert(error.message)
  }
}

const selectDivision = () => {
  divisionStore.setSelectedDivision(props.item)
}

const showContextMenu = computed(() => {
  return currentOpenContextMenuId.value === props.item.id
})

const openContextMenu = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  divisionStore.openContextMenu(props.item.id)
  
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
}

const closeContextMenu = () => {
  divisionStore.closeContextMenu()
}

const toggle = () => {
  if (hasChildren.value) {
    divisionStore.editIdOpen(props.item.id)
  }
}

const handleDocumentClick = (event) => {
  if (!event.target.closest('.context-menu')) {
    closeContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

document.addEventListener('click', closeContextMenu)
</script>

<style scoped>

.level-badge {
  display: inline-block;
  background-color: #e0e0e0;
  border-radius: 5px;
  padding: 2px 6px;
  margin-right: 2px;
  font-size: 0.8em;
  color: #555;
}

.tree-item {
  position: relative;
  margin-left: 5px;
  padding: 5px 0;
}

.tree-item-name {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
  position: relative;
  min-height: 36px;
}

.toggle-icon {
  cursor: pointer;
  width: 20px;
  text-align: center;
  font-size: 0.8em;
  color: #666;
}

.toggle-icon:hover {
  color: #333;
}

.tree-item-name {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.tree-item-name:hover {
  text-decoration: underline;
}

.tree-item-content:hover {
  background-color: #f0f0f0;
}

.ButtonContest {
  opacity: 1;
  transition: opacity 0.3s;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.ButtonContest:hover {
  background: #e0e0e0;
  color: #222;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.children {
  margin-left: 20px;
  border-left: 1px solid #ccc;
  padding-left: 10px;
}

.cursor-pointer {
  cursor: pointer;
  font-weight: bold;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.delete {
  color: #e74c3c;
  border-top: 1px solid #eee;
}

.menu-item.delete:hover {
  background-color: #fdeded;
}
</style>