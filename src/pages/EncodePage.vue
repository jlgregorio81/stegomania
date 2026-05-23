<template>
  <q-page class="q-pa-md" style="max-width: 640px; margin: 0 auto">
    <div class="q-mb-md">
      <q-btn flat icon="arrow_back" label="Voltar" to="/" no-caps />
    </div>

    <div class="text-h4 text-weight-bold q-mb-lg">
      <q-icon name="lock" color="primary" class="q-mr-sm" />
      Codificar
    </div>

    <!-- 1. Imagem -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">1. Selecione uma imagem</div>
        <q-file
          v-model="imageFile"
          label="Escolher imagem"
          accept="image/*"
          outlined
          @update:model-value="onImageSelected"
        >
          <template #prepend><q-icon name="image" /></template>
        </q-file>

        <div v-if="imagePreview" class="q-mt-md text-center">
          <img :src="imagePreview" style="max-width: 100%; max-height: 280px; border-radius: 8px" />
          <div v-if="maxCapacity > 0" class="text-caption text-grey-6 q-mt-xs">
            Capacidade: ~{{ maxCapacity }} caracteres
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 2. Senha -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">2. Defina uma senha</div>
        <q-input
          v-model="password"
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          outlined
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- 3. Mensagem -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">3. Digite a mensagem secreta</div>
        <q-input
          v-model="message"
          label="Mensagem secreta"
          type="textarea"
          outlined
          autogrow
          :rows="4"
        />
      </q-card-section>
    </q-card>

    <!-- Botão -->
    <q-btn
      color="primary"
      label="Codificar e baixar"
      icon="download"
      size="lg"
      unelevated
      rounded
      :disable="!imageFile || !password || !message"
      class="full-width q-mb-lg"
      @click="encodeAndDownload"
    />

    <!-- Resultado -->
    <q-card v-if="encodedDataUrl" flat bordered>
      <q-card-section class="text-center">
        <div class="text-subtitle1 text-weight-medium text-positive q-mb-sm">
          <q-icon name="check_circle" class="q-mr-xs" />
          Imagem codificada
        </div>
        <img :src="encodedDataUrl" style="max-width: 100%; max-height: 280px; border-radius: 8px" class="q-mb-md" />
        <br />
        <q-btn
          color="positive"
          label="Baixar imagem"
          icon="download"
          unelevated
          rounded
          @click="downloadImage"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { encodeMessage } from 'src/utils/stego'

const $q = useQuasar()

const imageFile = ref(null)
const password = ref('')
const message = ref('')
const showPassword = ref(false)
const imagePreview = ref(null)
const encodedDataUrl = ref(null)
const imageElement = ref(null)

const maxCapacity = computed(() => {
  if (!imageElement.value) return 0
  const w = imageElement.value.naturalWidth
  const h = imageElement.value.naturalHeight
  return Math.max(0, Math.floor((w * h * 3) / 8) - 16)
})

function onImageSelected(file) {
  imagePreview.value = null
  encodedDataUrl.value = null
  imageElement.value = null
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
    const img = new Image()
    img.onload = () => { imageElement.value = img }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

function encodeAndDownload() {
  if (!imageElement.value) return

  const canvas = document.createElement('canvas')
  canvas.width = imageElement.value.naturalWidth
  canvas.height = imageElement.value.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(imageElement.value, 0, 0)

  try {
    encodeMessage(ctx, canvas.width, canvas.height, message.value, password.value)
    encodedDataUrl.value = canvas.toDataURL('image/png')
    $q.notify({ type: 'positive', message: 'Mensagem codificada com sucesso!', icon: 'check_circle' })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Falha ao codificar', icon: 'error' })
  }
}

function downloadImage() {
  if (!encodedDataUrl.value) return
  const a = document.createElement('a')
  a.href = encodedDataUrl.value
  a.download = 'stego_encoded.png'
  a.click()
}
</script>
