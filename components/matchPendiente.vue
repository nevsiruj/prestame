<template>
  <div class="mt-6 bg-gray-50 p-4 rounded-lg">
    <h4 class="font-bold text-lg mb-2">
      Propiedades que coinciden con las preferencias
    </h4>
    <div v-if="isLoading" class="loader">Cargando...</div>
    <div v-else-if="propiedades.length === 0" class="no-results">
      No se encontraron propiedades pendientes.
    </div>
    <ul v-else class="property-list">
      <li
        v-for="propiedad in paginatedProperties"
        :key="propiedad.id"
        class="property-item mb-4"
      >
        <div
          class="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap"
        >
          <h3 class="flex-grow mb-2 sm:mb-0">
            <a
              :href="buildInmuebleUrl(propiedad)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline text-md font-regular"
            >
              {{ propiedad.titulo || propiedad.nombre || "Sin título" }}
            </a>
          </h3>

          <div class="flex flex-wrap mx-auto items-center space-x-2">
            <div class="flex items-center">
              <input
                id="matchEviados"
                type="checkbox"
                :checked="isMatchEnviado(propiedad.id)"
                @change="handleMatchCheckbox(propiedad)"
                class="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded-sm cursor-pointer"
                :disabled="isLoading || isLoadingMatches || !datasetsReady"
                :title="checkboxTitle(propiedad.id)"
              />
            </div>
            <button
              type="button"
              @click="openWhatsApp(propiedad)"
              class="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded"
              title="Enviar por WhatsApp"
            >
              WhatsApp
            </button>
            <button
              type="button"
              @click="openInmuebleModal(propiedad)"
              class="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
              title="Ver detalle de inmueble"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </li>
    </ul>

    <div
      v-if="propiedades.length > pageSize"
      class="mt-4 flex items-center justify-between"
    >
      <div class="text-sm text-gray-600">
        Mostrando
        {{ (currentPage - 1) * pageSize + 1 }}
        -
        {{ Math.min(currentPage * pageSize, propiedades.length) }}
        de {{ propiedades.length }}
      </div>

      <nav class="inline-flex items-center space-x-1" aria-label="Paginación">
        <button
          @click="goPrev"
          :disabled="currentPage === 1"
          class="px-2 py-1 rounded border bg-black text-white hover:bg-gray-600 disabled:opacity-50"
        >
          Anterior
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          @click="setPage(p)"
          :class="[
            'px-2 py-1 rounded border bg-black text-white',
            { 'bg-gray-600': p === currentPage },
          ]"
        >
          {{ p }}
        </button>

        <button
          @click="goNext"
          :disabled="currentPage === totalPages"
          class="px-2 py-1 rounded border bg-black text-white hover:bg-gray-600 disabled:opacity-50"
        >
          Siguiente
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import matchService from "~/services/matchService";

const props = defineProps({
  clienteId: {
    type: [Number, String],
    required: true,
  },
  clientDetails: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['open-inmueble', 'refresh-matches']);

// --- 1. PROPIEDADES Y ESTADO ---
const clienteId = computed(() => {
  const id = parseInt(props.clienteId);
  return isNaN(id) ? null : id;
});

// Estado de carga y datos
const isLoading = ref(true);
const isLoadingMatches = ref(false); // Para acciones específicas (checkbox)
const matchesPendientes = ref([]); // Almacena MatchDto[] (incluye el objeto Inmueble anidado)

// La lista de inmuebles que se renderizará
const propiedades = ref([]);
const datasetsReady = computed(() => !isLoading.value); // Asumo que esto indica que los datos están listos

// --- 2. PAGINACIÓN (Manteniendo tu lógica existente) ---
const currentPage = ref(1);
const pageSize = 10;
const totalPages = computed(() =>
  Math.ceil(propiedades.value.length / pageSize)
);

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return propiedades.value.slice(start, end);
});

// Implementa tus métodos de paginación (goPrev, goNext, setPage, visiblePages) aquí si no están fuera del script setup.
const goPrev = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const goNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const setPage = (p) => {
  currentPage.value = p;
};
// Lógica simple para visiblePages (ej. mostrar todas las páginas si es menos de 5)
const visiblePages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

// --- 3. FUNCIONES DE SERVICIO Y LÓGICA DE MATCH ---

/**
 * Llama al backend para obtener los matches pendientes (calculados y guardados).
 */
const fetchMatchesPendientes = async () => {
  if (!clienteId.value) {
    console.error("ID de cliente inválido.");
    return;
  }

  isLoading.value = true;
  try {
    const data = await matchService.getPendientesByCliente(clienteId.value);
    // Normalizar posibles formas de respuesta
    let items = [];
    if (Array.isArray(data)) items = data;
    else if (Array.isArray(data?.items)) items = data.items;
    else if (Array.isArray(data?.results)) items = data.results;
    else if (Array.isArray(data?.matches)) items = data.matches;
    else if (Array.isArray(data?.$values)) items = data.$values;
    else if (Array.isArray(data?.items?.$values)) items = data.items.$values;

    // Extraer propiedad de cada item (si viene como match)
    const extractProp = (it) => {
      if (!it) return null;
      // posibles nombres de campo
      const p = it.inmueble || it.Inmueble || it.propiedad || it.Propiedad || null;
      // Si el item ya parece ser una propiedad (tiene id/slug/titulo), úsalo directo
      if (!p && (it.id || it.slug || it.slugInmueble || it.titulo || it.nombre)) return it;
      return p || null;
    };

    // Guardar matches solo si tienen un id de match
    const looksLikeMatch = (it) => typeof it?.id === 'number' && (it.inmueble || it.Inmueble || it.propiedad || it.Propiedad);
    matchesPendientes.value = items.filter(looksLikeMatch)
      .sort((a, b) => (a.id || 0) - (b.id || 0)); // Ordenar por match ID ascendente

    // Propiedades renderizables - mantener el mismo orden que los matches
    const sortedItems = items.sort((a, b) => {
      const aId = a.id || a.matchId || 0;
      const bId = b.id || b.matchId || 0;
      return aId - bId;
    });
    propiedades.value = sortedItems.map(extractProp).filter(Boolean);
    currentPage.value = 1;
  } catch (error) {
    console.error("Error al obtener matches pendientes:", error);
    matchesPendientes.value = [];
    propiedades.value = [];
  } finally {
    isLoading.value = false;
  }
};

/**
 * Devuelve el objeto Match completo si la propiedad está actualmente pendiente
 */
const getMatchForPropiedad = (propiedadId) => {
  // Busca el match cuyo InmuebleId (que es igual a propiedad.id) esté en la lista de pendientes
  // Asumimos que propiedad.id es el Inmueble.Id
  return matchesPendientes.value.find(
    (match) => match.inmuebleId === propiedadId || match.propiedad?.id === propiedadId || match.inmueble?.id === propiedadId
  );
};

// Conjunto de ids de propiedades pendientes (si existen matches)
const pendientePropIds = computed(() => {
  const ids = new Set();
  (matchesPendientes.value || []).forEach((m) => {
    const pid = m?.inmuebleId || m?.propiedad?.id || m?.inmueble?.id || null;
    if (pid != null) ids.add(pid);
  });
  return ids;
});

/**
 * Determina si el checkbox debe estar marcado (es decir, si el Match ha sido enviado/procesado).
 * En la lista "pendientes", NINGUNO está enviado, por lo que el checkbox debe estar DESMARCADO.
 */
const isMatchEnviado = (propiedadId) => {
  // Si no tenemos matches pero sí propiedades, asumir que ninguna ha sido enviada (checkbox desmarcado)
  if (pendientePropIds.value.size === 0 && propiedades.value.length > 0) return false;
  // Si el id está en pendientes, no está enviado
  return !pendientePropIds.value.has(propiedadId);
};

/**
 * Maneja el cambio del checkbox: Marcar Match como Enviado.
 */
const handleMatchCheckbox = async (propiedad) => {
  const match = getMatchForPropiedad(propiedad.id);
  if (!match) return;

  isLoadingMatches.value = true;
  try {
    const result = await matchService.marcarComoEnviado(match.id);
    if (result.ok) {
      matchesPendientes.value = matchesPendientes.value.filter(
        (m) => m.id !== match.id
      );
      propiedades.value = propiedades.value.filter(
        (p) => p.id !== propiedad.id
      );
    }
  } catch (error) {
    console.error("Error al marcar como enviado:", error);
  } finally {
    isLoadingMatches.value = false;
  }
};

// --- 4. OTRAS FUNCIONES (Necesarias para tu template) ---

const buildInmuebleUrl = (propiedad) => {
  if (!propiedad) return null;
  const slug = propiedad.slugInmueble || propiedad.slug;
  if (slug) {
    return `https://homesguatemala.com/inmueble/${slug}`;
  }
  return null;
};

const openWhatsApp = (propiedad) => {
  const cli = props.clientDetails || {};
  const clientName = (cli.nombre || "").toString().trim();
  const shortName = clientName ? clientName.split(" ")[0] : "";
  
  const propiedadTitulo = propiedad.titulo || propiedad.nombre || "Propiedad";
  const propiedadUrl = buildInmuebleUrl(propiedad);

  const msgBase = `Hola ${shortName || clientName || "cliente"}, tenemos la siguiente propiedad disponible para usted: ${propiedadTitulo}`;
  const fullMsg = propiedadUrl ? `${msgBase}\n${propiedadUrl}` : msgBase;
  const mensajeCodificado = encodeURIComponent(fullMsg);

  const phoneCandidate = cli.telefonoCompleto || cli.telefono || cli.phone || cli.celular || cli.mobile || null;
  const telefonoLimpio = formatPhoneForWhatsApp(phoneCandidate);

  const urlWhatsApp = telefonoLimpio
    ? `https://wa.me/${telefonoLimpio}?text=${mensajeCodificado}`
    : `https://wa.me/?text=${mensajeCodificado}`;

  window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
};

const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return null;
  const cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.startsWith('1') || cleaned.startsWith('52') || cleaned.startsWith('51') || 
      cleaned.startsWith('57') || cleaned.startsWith('58') || cleaned.length >= 11) {
    return cleaned;
  }
  if (cleaned.length === 8) {
    return '502' + cleaned;
  }
  return cleaned;
};

const openInmuebleModal = (propiedad) => {
  emit('open-inmueble', { value: propiedad, source: 'matchPendiente' });
};

const checkboxTitle = (propiedadId) => {
  // Si el match existe en la lista de pendientes, el título es "Marcar como enviado"
  return getMatchForPropiedad(propiedadId)
    ? "Marcar como enviado"
    : "Match ya procesado (Enviado/Eliminado)";
};

// --- 5. CICLO DE VIDA Y WATCHERS ---

// Observar cambios en clienteId para recargar los matches
watch(() => props.clienteId, (newId) => {
  if (newId) {
    fetchMatchesPendientes();
  }
}, { immediate: true });

// Método público para refrescar desde el componente padre
const refresh = () => {
  fetchMatchesPendientes();
};

// Exponer el método refresh para que el padre pueda llamarlo
defineExpose({
  refresh,
});
</script>
