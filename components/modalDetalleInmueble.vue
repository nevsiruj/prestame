<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 modal-overlay bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  >
    <div
      class="relative bg-white rounded-lg shadow w-full max-w-6xl max-h-[90vh] overflow-auto"
      style="
        width: 90%;
        max-width: 1300px;
        height: 90%;
        max-height: 800px;
        overflow-y: auto;
      "
    >
      <LoaderModal v-if="isLoading" />

      <div v-else>
        <div class="flex justify-between items-center p-4 md:p-5 border-b">
          <h3 class="text-xl font-semibold text-gray-900">
            {{ inmueble.titulo }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="p-4 md:p-5">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-4">
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-2 border-b pb-2">
                  Información Principal
                </h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-500"
                      >Código</label
                    >
                    <p class="text-gray-900 font-semibold">
                      {{ inmueble.codigoPropiedad || "N/A" }}
                    </p>
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-500"
                      >Precio</label
                    >
                    <p class="text-gray-900 font-semibold">
                      ${{ formatPrice(inmueble.precio) }}
                    </p>
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-500"
                      >Ubicación</label
                    >
                    <p class="text-gray-900 font-semibold">
                      {{ inmueble.ubicaciones || "No especificado" }}
                    </p>
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-500"
                      >Operación</label
                    >
                    <p class="text-gray-900 font-semibold">
                      {{ inmueble.operaciones || "No especificado" }}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-2 border-b pb-2">
                  Imagen Principal
                </h4>
                <img
                  :src="inmueble.imagenPrincipal"
                  alt="Imagen principal"
                  class="w-full object-cover rounded shadow-md"
                  v-if="inmueble.imagenPrincipal"
                />
                <p v-else class="text-gray-500">Sin imagen disponible</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-2 border-b pb-2">
                  Características
                </h4>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-500"
                      >Habitaciones</label
                    >
                    <p class="text-gray-900 font-semibold">
                      {{ inmueble.habitaciones || 0 }}
                    </p>
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-500"
                      >Baños</label
                    >
                    <p class="text-gray-900 font-semibold">
                      {{ inmueble.banos || 0 }}
                    </p>
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-500"
                      >Parqueos</label
                    >
                    <p class="text-gray-900 font-semibold">
                      {{ inmueble.parqueos || 0 }}
                    </p>
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-500"
                      >M² Construcción</label
                    >
                    <p class="text-gray-900 font-semibold">
                      {{ inmueble.metrosCuadrados || 0 }} m²
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-2 border-b pb-2">
                  Amenidades
                </h4>
                <div
                  v-if="inmueble.amenidades.length > 0"
                  class="flex flex-wrap gap-2"
                >
                  <span
                    v-for="(amenidad, index) in inmueble.amenidades"
                    :key="amenidad.id || index"
                    class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {{ amenidad.nombre || "Desconocida" }}
                  </span>
                </div>
                <p v-else class="text-gray-500">No hay amenidades definidas.</p>
              </div>

              <div
                v-if="
                  inmueble.imagenesReferencia &&
                  inmueble.imagenesReferencia.length
                "
              >
                <h3>Ver más Imágenes</h3>
                <div class="grid grid-cols-3 gap-4">
                  <img
                    v-for="(url, index) in inmueble.imagenesReferencia"
                    :key="index"
                    :src="url"
                    alt="Imagen de referencia"
                    class="w-full h-auto rounded shadow"
                  />
                </div>
              </div>

              <div v-else>
                <p>No hay imágenes de referencia disponibles.</p>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <h4 class="text-lg font-medium text-gray-900 mb-2 border-b pb-2">
              Descripción
            </h4>
            <p
              class="text-gray-700 whitespace-pre-line"
              v-html="cleanContent(inmueble.contenido)"
            ></p>
          </div>
        </div>
      </div>

      <div class="flex justify-end p-4 md:p-5 border-t">
        <button
          @click="closeModal"
          class="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 rounded-lg text-sm px-5 py-2.5"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";
import LoaderModal from "./LoaderModal.vue"; 

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
    default: false,
  },
  inmueble: {
    type: Object,
    default: () => ({
      codigoPropiedad: "",
      titulo: "",
      precio: 0,
      habitaciones: 0,
      banos: 0,
      parqueos: 0,
      metrosCuadrados: 0,
      imagenPrincipal: "",
      contenido: "",
      tipos: "",
      operaciones: "",
      ubicaciones: "",
      luxury: false,
      video: "",
      amenidades: [],
      imagenesReferencia: [],
    }),
  },
});

const emit = defineEmits(["close"]);

const isLoading = ref(true);

// Simular carga de datos del inmueble con un delay de 2 segundos
watch(
  () => props.inmueble,
  (newVal) => {
    if (props.isOpen) {
      if (!newVal || Object.keys(newVal).length === 0 || newVal.codigoPropiedad === "") {
        isLoading.value = true;
      } else {
        setTimeout(() => {
          isLoading.value = false;
        }, 2000); // Delay de 2 segundos
      }
    }
  },
  { immediate: true }
);

const formatPrice = (price) => {
  return Number(price).toLocaleString("es-GT");
};

const cleanContent = (content) => {
  if (!content) return "";
  return content.replace(/\\n/g, "\n").replace(/&nbsp;/g, "");
};

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
.modal-overlay {
  backdrop-filter: blur(0.5px);
}
</style>