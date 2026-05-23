<template>
  <q-page class="flex flex-center column q-pa-xl">
    <div class="text-center">
      <q-icon name="lock" size="100px" color="primary" />
      <div class="text-h1 text-weight-bold text-primary q-my-md">Stego</div>
      <div class="text-subtitle1 text-grey-6 q-mb-xl">
        Oculte mensagens secretas dentro de imagens
      </div>

      <div class="row q-gutter-md justify-center">
        <q-btn
          to="/encode"
          color="primary"
          icon="lock"
          label="Codificar mensagem"
          size="lg"
          unelevated
          rounded
          style="min-width: 220px"
        />
        <q-btn
          to="/decode"
          color="secondary"
          icon="search"
          label="Decodificar mensagem"
          size="lg"
          outline
          rounded
          style="min-width: 220px"
        />
      </div>
    </div>
  </q-page>
</template>
