<template>
  <transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Редактировать сотрудника</h3>
          <button class="close-btn" @click="$emit('cancel')">&times;</button>
        </div>
        <form ref="formRef" @submit.prevent="handleSubmit">
          <div class="form-scroll">
            <div class="form-group">
              <label>Фотография</label>
              <div class="file-input">
                <input 
                  type="file" 
                  @change="handlePhotoChange" 
                  accept="image/*"
                >
                <span>{{ form.photo ? form.photo.name : 'Выберите файл' }}</span>
              </div>
              <div v-if="previewPhoto" class="current-photo">
                <img :src="previewPhoto" alt="Новое фото">
                <span class="photo-label">Новое фото</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Фамилия <span class="required-star">*</span></label>
                <input 
                  v-model="form.last_name" 
                  required 
                  placeholder="Иванов" 
                />
              </div>
              <div class="form-group">
                <label>Имя <span class="required-star">*</span></label>
                <input 
                  v-model="form.first_name" 
                  required 
                  placeholder="Иван" 
                />
              </div>
            </div>
            <div class="form-group">
              <label>Отчество <span class="required-star">*</span></label>
              <input 
                v-model="form.middle_name" 
                required
                placeholder="Иванович" 
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Дата рождения <span class="required-star">*</span></label>
                <input 
                  v-model="form.birth_date" 
                  type="date" 
                  required
                />
              </div>
              <div class="form-group">
                <label>Дата приема <span class="required-star">*</span></label>
                <input 
                  v-model="form.hire_date" 
                  type="date" 
                  required
                />
              </div>
            </div>
            <div class="form-group">
              <label>Должность <span class="required-star">*</span></label>
              <input 
                v-model="form.position" 
                required
                placeholder="Должность сотрудника" 
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email <span class="required-star">*</span></label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  required
                  placeholder="email@example.com" 
                />
              </div>
              <div class="form-group">
                <label>Телефон <span class="required-star">*</span></label>
                <input 
                  v-model="form.phone" 
                  required
                  placeholder="+7 (999) 999-99-99" 
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  person: Object
})
const emit = defineEmits(['updated', 'cancel'])
const currentPhoto = ref('')

const formRef = ref(null)

const form = reactive({
  last_name: '',
  first_name: '',
  position: '',
  email: '',
  phone: '',
  birth_date: '',
  hire_date: '',
  middle_name: '',
  id: null,
  photo: null
})

const previewPhoto = ref(null);

watch(() => props.person, (newPerson) => {
  if (newPerson) {
    form.last_name = newPerson.last_name || ''
    form.first_name = newPerson.first_name || ''
    form.position = newPerson.position || ''
    form.email = newPerson.email || ''
    form.phone = newPerson.phone || ''
    form.birth_date = newPerson.birth_date || ''
    form.hire_date = newPerson.hire_date || ''
    form.middle_name = newPerson.middle_name || ''
    form.id = newPerson.id || null
    
    currentPhoto.value = newPerson.photo || ''

    previewPhoto.value = null
    form.photo = null
  }
}, { immediate: true })

const handlePhotoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.photo = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      previewPhoto.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    form.photo = null
    previewPhoto.value = null
  }
}

const validateForm = () => {
  if (!formRef.value) return false
  
  const isValid = formRef.value.checkValidity()
  
  if (!isValid) {
    const invalidFields = formRef.value.querySelectorAll(':invalid')
    invalidFields.forEach(field => {
      field.classList.add('invalid')

      setTimeout(() => {
        field.classList.remove('invalid')
      }, 3000)
    })
  }
  
  return isValid
}

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  return /^\+7\d{10}$/.test(phone.replace(/\D/g, ''));
};

const handleSubmit = () => {
  if (!validateForm()) return;
  
  if (!validateEmail(form.email)) {
    const emailInput = formRef.value.querySelector('input[type="email"]');
    emailInput.classList.add('invalid');
    setTimeout(() => emailInput.classList.remove('invalid'), 3000);
    return;
  }

  const cleanedPhone = form.phone.replace(/\D/g, '');
  if (!validatePhone(form.phone)) {
    const phoneInput = formRef.value.querySelector('input[placeholder="+7 (999) 999-99-99"]');
    phoneInput.classList.add('invalid');
    setTimeout(() => phoneInput.classList.remove('invalid'), 3000);
    return;
  }

  form.phone = `+7${cleanedPhone.slice(1)}`;

  const formData = new FormData();
  
  Object.keys(form).forEach(key => {
    if (key !== 'id' && form[key] !== null) {
      formData.append(key, form[key]);
    }
  });
  formData.append('id', form.id);
  emit('updated', formData);
}
</script>

<style scoped>
input.invalid {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2) !important;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.modal-overlay {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  transition: opacity 0.4s ease;
}

.modal-content {
  background: white;
  border-radius: 18px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 540px;
  overflow: hidden;
  transform: translateY(20px) scale(0.95);
  animation: modalIn 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

@keyframes modalIn {
  to { 
    transform: translateY(0) scale(1); 
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #4f46e5, #3730a3);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.modal-header h3 {
  margin: 0;
  font-weight: 700;
  font-size: 1.6rem;
  letter-spacing: -0.5px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2.2rem;
  cursor: pointer;
  padding: 0 12px;
  transition: all 0.3s;
  line-height: 1;
}

.close-btn:hover {
  transform: scale(1.15);
}

.form-scroll {
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.05rem;
}

.form-group input {
  width: 90%;
  padding: 15px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.05rem;
  transition: all 0.3s;
  background: #f8fafc;
}

.form-row .form-group input {
  width: 80%;
  padding: 15px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.05rem;
  transition: all 0.3s;
  background: #f8fafc;
}

.form-group input:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2);
  background: white;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 5px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.file-input {
  position: relative;
  display: block;
  width: 100%;
  margin-bottom: 20px;
}

.file-input input[type="file"] {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input span {
  display: block;
  padding: 14px 20px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  text-align: center;
  transition: all 0.3s;
  font-weight: 500;
  cursor: pointer;
}

.file-input:hover span {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #475569;
}

.current-photo {
  margin-top: 20px;
  text-align: center;
  padding: 15px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e0e7ff;
}

.current-photo img {
  width: 150px;
  height: 200px; 
  border-radius: 6px;
  border: 3px solid white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.photo-label {
  display: block;
  margin-top: 12px;
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
}

.modal-footer {
  background: #f8f9fa;
  padding: 20px 28px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.btn {
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 130px;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #3730a3);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.form-group {
  opacity: 0;
  transform: translateY(10px);
  animation: formIn 0.4s forwards;
}

@keyframes formIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group:nth-child(1) { animation-delay: 0.1s; }
.form-group:nth-child(2) { animation-delay: 0.15s; }
.form-group:nth-child(3) { animation-delay: 0.2s; }
.form-group:nth-child(4) { animation-delay: 0.25s; }
.form-group:nth-child(5) { animation-delay: 0.3s; }
.form-group:nth-child(6) { animation-delay: 0.35s; }
.form-group:nth-child(7) { animation-delay: 0.4s; }
.form-group:nth-child(8) { animation-delay: 0.45s; }
</style>