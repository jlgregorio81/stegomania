<template>
  <q-page class="q-pa-md" style="max-width: 640px; margin: 0 auto">
    <div class="q-mb-md">
      <q-btn flat icon="arrow_back" label="Voltar" to="/" no-caps />
    </div>

    <div class="text-h4 text-weight-bold q-mb-lg">
      <q-icon name="search" color="secondary" class="q-mr-sm" />
      Decodificar
    </div>

    <!-- 1. Imagem -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">1. Selecione a imagem codificada</div>
        <q-file
          v-model="imageFile"
          label="Escolher imagem"
          accept="image/*"
          outlined
          @update:model-value="onImageSelected"
        >
          <template #prepend><q-icon name="image" /></template>
        </q-file>
      </q-card-section>
    </q-card>

    <!-- 2. Senha -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">2. Digite a senha</div>
        <q-input
          v-model="password"
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          outlined
          @keydown.enter="tryDecode"
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

    <!-- Botão -->
    <q-btn
      color="secondary"
      label="Decodificar"
      icon="lock_open"
      size="lg"
      unelevated
      rounded
      :disable="!imageFile || !password"
      :loading="decoding"
      class="full-width q-mb-lg"
      @click="tryDecode"
    />

    <!-- Mensagem revelada -->
    <q-card v-if="decodedMessage !== null" flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium text-positive q-mb-sm">
          <q-icon name="lock_open" class="q-mr-xs" />
          Mensagem revelada
        </div>
        <q-input
          v-model="decodedMessage"
          type="textarea"
          outlined
          readonly
          autogrow
          :rows="5"
          label="Mensagem oculta"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { decodeMessage } from 'src/utils/stego'

const $q = useQuasar()

const imageFile = ref(null)
const password = ref('')
const showPassword = ref(false)
const decodedMessage = ref(null)
const decoding = ref(false)
const imageElement = ref(null)

function onImageSelected(file) {
  imageElement.value = null
  decodedMessage.value = null
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => { imageElement.value = img }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

function tryDecode() {
  if (!imageElement.value || !password.value) return

  decoding.value = true
  decodedMessage.value = null

  setTimeout(() => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = imageElement.value.naturalWidth
      canvas.height = imageElement.value.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(imageElement.value, 0, 0)

      const msg = decodeMessage(ctx, canvas.width, canvas.height, password.value)
      decodedMessage.value = msg

      $q.notify({
        type: 'positive',
        message: 'Mensagem decodificada com sucesso!',
        icon: 'lock_open',
        position: 'top'
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Senha incorreta! Não foi possível decodificar a mensagem.',
        icon: 'lock',
        position: 'top'
      })
    } finally {
      decoding.value = false
    }
  }, 50)
}
</script>
