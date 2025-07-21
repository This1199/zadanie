<template>
  <transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Добавить {{ nextLevelName }}</h3>
          <button class="close-btn" @click="$emit('cancel')">&times;</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-scroll">
            <div class="form-group">
              <label>Название</label>
              <input v-model="form.name" required placeholder="Введите название" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Отмена</button>
            <button type="submit" class="btn btn-primary">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  parentLevel: String
})

const emit = defineEmits(['added', 'cancel'])

const nextLevelName = computed(() => {
  return {
    'service': 'Управление',
    'department': 'Отдел',
    'section': 'Группу'
  }[props.parentLevel] || 'Подразделение'
})

const form = reactive({
  name: '',
  parent: null
})

const handleSubmit = () => {
  emit('added', { ...form })
}

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  transition: opacity 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  transform: scale(0.95);
  animation: modalIn 0.3s forwards;
}

@keyframes modalIn {
  to { transform: scale(1); }
}

.modal-header {
  background: linear-gradient(135deg, #3498db, #1a5276);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 1.4rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0 10px;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.1);
}

.form-group {
  padding: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input {
  width: 90%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.modal-footer {
  background: #f8f9fa;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
}

.btn-secondary {
  background: #f1f2f6;
  color: #7f8c8d;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>