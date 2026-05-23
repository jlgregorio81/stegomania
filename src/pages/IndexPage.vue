<template>
  <q-page class="flex flex-center column q-pa-xl">
    <div class="text-center">
      <q-icon name="image_search" size="100px" color="primary" />
      <div class="text-h1 text-weight-bold text-primary q-my-md">Stego Mania</div>
      <p class="text-subtitle1 text-grey-6 q-mb-xl">
        Oculte mensagens secretas dentro de imagens
      </p>

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
    <div class="q-mt-lg q-pa-md text-center text-grey-7">
      <p>Desenvolvido por J. L. Gregório</p>
      <p><a href="https://www.jlgregorio.com.br" target="_blank"> www.jlgregorio.com.br</a></p>
    </div>
  </q-page>
</template>
