<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        Bienvenido, {{ nombreAgente }}
      </h1>
    </div>

    <div
      class="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 mt-6 mb-6 w-full"
    >
      <div class="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <select
          v-if="isAdmin"
          v-model="selectedAgent"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 p-2 w-full sm:w-auto flex-shrink-0"
        >
          <option value="all">Todos los agentes</option>
          <option
            v-for="agente in agentesArray"
            :key="agente.id"
            :value="agente.id"
          >
            {{ agente.nombre }} {{ agente.apellido }}
          </option>
        </select>

        <div class="relative w-full sm:flex-1 lg:max-w-xs">
          <input
            v-model="searchTerm"
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full ps-3 p-2"
            :placeholder="searchPlaceholder"
          />
        </div>

        <input
          v-model="dateFilter.startDate"
          type="date"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 px-2 py-1.5 w-[calc(50%-4px)] sm:w-auto flex-shrink-0"
          placeholder="Fecha inicio"
        />
        <input
          v-model="dateFilter.endDate"
          type="date"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 px-2 py-1.5 w-[calc(50%-4px)] sm:w-auto flex-shrink-0"
          placeholder="Fecha fin"
        />
      </div>

      <div class="flex justify-center w-full md:w-auto md:justify-end">
        <button
          @click="openAddModal"
          class="px-4 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium w-full sm:w-auto"
        >
          Agregar Cliente
        </button>
      </div>
    </div>

    <Loader v-if="isLoading" class="my-8" />

    <div v-else class="flex overflow-x-auto gap-4 pb-4">
      <div
        v-for="column in columns"
        :key="column.estado"
        class="min-w-[300px] bg-gray-50 rounded-lg p-3 border-t-4"
        :class="column.border"
      >
        <h3 class="font-semibold">{{ column.title }}</h3>
        <draggable
          :list="getFilteredTasksByStatus(column.estado)"
          group="tasks"
          @change="(evt) => handleTaskMove(evt, column.estado)"
          item-key="id"
          class="min-h-[100%] space-y-2 mt-2"
        >
          <template #item="{ element }">
            <TaskCard :task="element" @open-contact="openContactModal" />
          </template>
        </draggable>
      </div>
    </div>

    <div
      id="contactModal"
      tabindex="-1"
      aria-hidden="true"
      class="hidden fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="relative w-full max-w-6xl bg-white rounded-lg shadow max-h-[90vh] overflow-hidden"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 md:p-5 border-b sticky top-0 bg-white z-10"
        >
          <h3 class="text-xl font-semibold">
            Contacto con {{ selectedTask?.Nombre || selectedTask?.nombre }}
          </h3>
          <button
            @click="closeContactModal"
            type="button"
            class="text-gray-700 border border-gray-300 py-1 px-2 hover:text-gray-900 rounded-md"
          >
            X
          </button>
        </div>

        <!-- Contenido principal con scroll -->
        <div class="p-4 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          <!-- Loader mientras se cargan los datos -->
          <div v-if="isLoadingDetails" class="relative min-h-[200px]">
            <div class="absolute inset-0">
              <Loader class="!absolute !w-full !h-full" />
            </div>
          </div>

          <div v-else-if="clientDetails" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Información Personal -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-bold text-lg mb-4">Información Personal</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Nombre Completo:</span
                    >
                    <p class="">
                      {{ clientDetails.nombre }} {{ clientDetails.apellido }}
                    </p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Teléfono:</span
                    >
                    <p class="">{{ clientDetails.telefono || "N/A" }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Email:</span
                    >
                    <p class="">{{ clientDetails.email || "N/A" }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Fecha de Registro:</span
                    >
                    <p class="">
                      {{ formatDate(clientDetails.fechaRegistro) || "N/A" }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Preferencias -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-bold text-lg mb-4">Preferencias</h4>
                <div
                  v-if="preferencias"
                  class="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Tipo Inmueble:</span
                    >
                    <p class="">{{ preferencias.tipo || "N/A" }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Operación:</span
                    >
                    <p class="">{{ preferencias.operacion || "N/A" }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Precio Mínimo:</span
                    >
                    <p class="">
                      {{
                        preferencias.precioMin != null
                          ? `$${Number(
                              preferencias.precioMin
                            ).toLocaleString()}`
                          : "N/A"
                      }}
                    </p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Precio Máximo:</span
                    >
                    <p class="">
                      {{
                        preferencias.precioMax != null
                          ? `$${Number(
                              preferencias.precioMax
                            ).toLocaleString()}`
                          : "N/A"
                      }}
                    </p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Habitaciones:</span
                    >
                    <p class="">{{ preferencias.habitaciones ?? "N/A" }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Baños:</span
                    >
                    <p class="">{{ preferencias.banos ?? "N/A" }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500"
                      >Ubicaciones:</span
                    >
                    <p class="">{{ preferencias.ubicacion ?? "N/A" }}</p>
                  </div>
                </div>
                <p v-else class="text-gray-500">
                  No hay preferencias cargadas.
                </p>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-bold text-lg">
                  Historial de seguimiento
                  <!-- ({{
        selectedTask?.Interacciones?.length || 0
      }}) -->
                </h4>

                <button
                  @click="loadClientDetails"
                  class="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
                >
                  Refrescar
                </button>
              </div>

              <div
                v-if="!selectedTask?.Interacciones?.length"
                class="text-sm text-gray-500"
              >
                No hay interacciones registradas.
              </div>

              <div v-else class="relative overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="px-4 py-2">Fecha</th>
                      <th class="px-4 py-2">Tipo</th>
                      <th class="px-4 py-2">Descripción</th>
                      <th class="px-4 py-2">Estado</th>
                      <th class="px-4 py-2">Próximo Contacto</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr
                      v-for="(
                        interaccion, index
                      ) in selectedTask.Interacciones.slice().reverse()"
                      :key="index"
                      class="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                    >
                      <td class="px-4 py-2">
                        {{
                          formatDateTime(interaccion.Fecha || interaccion.fecha)
                        }}
                      </td>
                      <td class="px-4 py-2">
                        {{
                          interaccion.Tipo || interaccion.tipo || "Interacción"
                        }}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-900 max-w-xs">
                        <div class="line-clamp-2">
                          {{
                            interaccion.Descripcion ||
                            interaccion.descripcion ||
                            "Sin descripción"
                          }}
                        </div>
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-900">
                        {{
                          formatStatusForDisplay(
                            interaccion.StatusInteraccion ||
                              interaccion.statusInteraccion
                          )
                        }}
                      </td>
                      <td class="px-4 py-2">
                        <span
                          v-if="
                            interaccion.FechaVencimiento ||
                            interaccion.fechaVencimiento
                          "
                        >
                          {{
                            formatDateTime(
                              interaccion.FechaVencimiento ||
                                interaccion.fechaVencimiento
                            )
                          }}
                        </span>
                        <span v-else class="text-gray-400">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Matches Pendientes - Componente Reutilizable -->
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <div class="flex items-center justify-end mb-2">
                <button
                  type="button"
                  class="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
                  @click="$refs.matchPendienteRef?.refresh && $refs.matchPendienteRef.refresh()"
                >
                  Refrescar
                </button>
              </div>
              <matchPendiente
                v-if="clientDetails"
                :clienteId="selectedTask?.clienteId || selectedTask?.id"
                :clientDetails="clientDetails"
                @open-inmueble="handleOpenInmueble"
                ref="matchPendienteRef"
              />
            </div>

            <!-- Matches Enviados -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-bold text-lg">
                  Matches Enviados
                  <!-- ({{ matchesEnviados.length }}) -->
                </h4>
                <button
                  @click="loadClientDetails"
                  class="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
                >
                  Refrescar
                </button>
              </div>

              <div
                v-if="matchesEnviados.length === 0"
                class="text-sm text-gray-500"
              >
                No hay matches enviados.
              </div>

              <ul v-else class="space-y-3">
                <li
                  v-for="m in matchesEnviados"
                  :key="m.id"
                  class="flex items-center justify-between"
                >
                  <div class="flex-grow min-w-0">
                    <a
                      v-if="buildInmuebleUrl(m.propiedad)"
                      :href="buildInmuebleUrl(m.propiedad)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-600 hover:underline font-medium block truncate"
                    >
                      {{
                        m.propiedad?.titulo ||
                        m.tituloPropiedad ||
                        "Propiedad " + m.codigoPropiedad
                      }}
                    </a>
                    <span
                      v-else
                      class="text-gray-700 font-medium block truncate"
                    >
                      {{
                        m.propiedad?.titulo ||
                        m.tituloPropiedad ||
                        "Propiedad " + m.codigoPropiedad
                      }}
                    </span>
                    <!-- <span class="text-xs text-gray-500">
                      Enviado:
                      {{ m.fechaEnvio ? formatDate(m.fechaEnvio) : "-" }}
                    </span> -->
                  </div>

                  <div class="flex items-center gap-2 flex-shrink-0 ml-4">
                    <span class="text-xs text-gray-500">
                      Enviado:
                      {{ m.fechaEnvio ? formatDate(m.fechaEnvio) : "-" }}
                    </span>
                    <button
                      @click="eliminarMatch(m.id, 'enviado')"
                      class="inline-flex items-center px-3 py-1 text-sm font-medium text-red-500"
                      title="Eliminar Match"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Formulario de Interacción -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-bold text-lg mb-4">Registrar Interacción</h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900"
                    >Tipo de Contacto</label
                  >
                  <select
                    v-model="contactData.tipo"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                  >
                    <option value="llamada">Llamada</option>
                    <option value="mensaje">Mensaje</option>
                    <option value="email">Email</option>
                    <option value="visita">Visita</option>
                  </select>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900"
                    >Estado</label
                  >
                  <select
                    v-model="currentRecordatorio.estadoInteraccionRaw"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                  >
                    <option
                      v-for="opt in statusOptions"
                      :key="opt.key"
                      :value="opt.key"
                    >
                      {{ opt.title }}
                    </option>
                  </select>
                </div>

                <div class="md:col-span-2">
                  <label class="block mb-2 text-sm font-medium text-gray-900"
                    >Notas</label
                  >
                  <textarea
                    v-model="contactData.nota"
                    rows="3"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                    placeholder="Agregue notas de la interacción..."
                  ></textarea>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900"
                    >Fecha próximo contacto</label
                  >
                  <input
                    v-model="contactData.fechaVencimiento"
                    type="datetime-local"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end p-4 border-t sticky bottom-0 bg-white z-10"
        >
          <button
            @click="closeContactModal"
            type="button"
            class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-2"
          >
            Cancelar
          </button>
          <button
            @click="saveContact"
            type="button"
            class="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- <AgregarClienteModal
    :isOpen="showAddModal"
    @close="showAddModal = false"
    @client-added="handleClientAdded"
  /> -->
  <AgregarClienteModal
    :isOpen="showAddModal"
    @close="showAddModal = false"
    @client-added="onClientSaved"
    @client-updated="onClientSaved"
  />

  <!-- Modal de Sesión Expirada -->
  <div v-if="isSessionExpired" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-gray-800/50"></div>
    <div class="relative flex items-center justify-center min-h-full p-4">
      <div class="bg-white rounded-lg shadow p-6 max-w-sm w-full">
        <h2 class="text-xl font-bold text-gray-800 mb-2">Sesión expirada</h2>
        <p class="text-gray-600">
          Tu sesión ha caducado o no existe un token activo. Inicia sesión
          nuevamente para continuar.
        </p>
        <p class="text-xs text-gray-500 mt-3">
          Serás redirigido en {{ redirectCountdown }}s o pulsa "Iniciar sesión".
        </p>
        <div class="flex justify-end mt-6">
          <button
            @click="redirectToLogin"
            class="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
    <task-component 
      @open-inmueble="handleOpenInmueble"     
    />
    
    <!-- Modal de detalle inmueble en el padre -->
    <detalle-inmueble-modal 
      v-if="showInmuebleModal" 
      :inmueble-id="selectedInmuebleId"
      :inmueble-slug="selectedInmuebleSlug"
      :inmueble-data="selectedInmuebleData"
      @close="closeInmuebleModal"
    />
  </div>
</template>

<script>
import draggable from "vuedraggable";
import TaskCard from "../bandejaTarea/taskcard.vue";
import AgregarClienteModal from "../agregarClienteModal.vue";
import matchPendiente from "../matchPendiente.vue";
import { Modal } from "flowbite";
import Swal from "sweetalert2";
import inmuebleService from "@/services/inmuebleService";

// Servicios
import clienteService from "@/services/clienteService";
import agenteService from "@/services/agenteService";
import interaccionService from "@/services/interaccionService";
import matchService from "@/services/matchService";

// Constantes
import { statusMap } from "../../api/constants";

// (opcional) store para roles si lo tienes
import { useAuthStore } from "@/stores/auth";

export default {
  components: {
    draggable,
    TaskCard,
    AgregarClienteModal,
    matchPendiente,
  },
  data() {
    return {
      showInmuebleModal: false,
      selectedInmuebleId: null,
      selectedInmuebleSlug: null,
      selectedInmuebleData: null,
      searchTerm: "", // Término de búsqueda
      searchFilter: "all", // Filtro de búsqueda: all, person, agent
      showAddModal: false,
      contactModal: null,
      selectedTask: null,
      isLoadingDetails: false, // Nuevo: para el loader de detalles
      clientDetails: null, // Nuevo: para datos generales del cliente
      matchesPendientes: [], // Nuevo: para Matches Pendientes
      matchesEnviados: [], // Nuevo: para Matches Enviados
      preferencias: null, // Nuevo: para Preferencias del cliente
      matchPendienteRef: null, // Referencia al componente de matches pendientes
      pagination: {
        currentPage: 1,
        perPage: 7,
        total: 0,
      },
      contactData: {
        tipo: "llamada",
        nota: "",
        fechaVencimiento: "",
      },
      currentRecordatorio: { estadoInteraccionRaw: null }, // <- agregado
      nombreAgente: "Cargando...",
      agenteId: null,
      isAdmin: false, // <- NUEVO
      originalStatus: null, // <- nuevo: guarda el status previo para poder revertir
      columns: [
        {
          title: "Contacto Inicial Pendiente",
          estado: "contacto_inicial_pendiente",
          border: "border-gray-500",
        },
        {
          title: "Seguimiento 24h",
          estado: "seguimiento_24h",
          border: "border-yellow-500",
        },
        {
          title: "Agendó Cita",
          estado: "agendo_cita",
          border: "border-green-500",
        },
        {
          title: "Negociación",
          estado: "negociacion",
          border: "border-green-500",
        },
        {
          title: "Cierre en proceso",
          estado: "cierre_proceso",
          border: "border-green-500",
        },
        {
          title: "Cierre exitoso",
          estado: "cierre_exitoso",
          border: "border-green-500",
        },
        {
          title: "Seguimiento a Largo Plazo",
          estado: "seguimiento_largo_plazo",
          border: "border-yellow-500",
        },
        {
          title: "Descartado",
          estado: "descartado",
          border: "border-yellow-500",
        },
      ],
      tasks: [],
      agentesArray: [], // <- nuevo arreglo para todos los agentes
      selectedAgent: "all", // <- nuevo dato para el agente seleccionado
      dateFilter: {
        startDate: "",
        endDate: "",
      },
      isSessionExpired: false,
      sessionCheckTimer: null,
      redirectCountdown: 5,
      autoRedirectTimer: null,
    };
    
  },

  async mounted() {
    try {
      const userData = await agenteService.getCurrentUser();
      const agente = userData?.$values ? userData.$values[0] : userData;

      if (!agente) throw new Error("Datos incompletos del usuario");

      const nombre = agente.Nombre || agente.nombre || "";
      const apellido = agente.Apellido || agente.apellido || "";

      this.nombreAgente = `${nombre} ${apellido}`;
      this.agenteId =
        agente.Id || agente.id || agente.AgenteId || agente.usuarioId || null;

      // Detectar rol admin
      try {
        const auth = useAuthStore?.();
        const storeIsAdmin =
          !!auth &&
          ((typeof auth.hasRole === "function" && auth.hasRole("admin")) ||
            (Array.isArray(auth.roles) &&
              auth.roles
                .map((r) => String(r).toLowerCase())
                .includes("admin")));

        const apiRoles = (agente.Roles || agente.roles || []).map((r) =>
          String(r).toLowerCase()
        );
        const apiSingle = String(agente.Rol || agente.rol || "").toLowerCase();

        this.isAdmin =
          storeIsAdmin || apiRoles.includes("admin") || apiSingle === "admin";
      } catch {
        const apiRoles = (agente.Roles || agente.roles || []).map((r) =>
          String(r).toLowerCase()
        );
        const apiSingle = String(agente.Rol || agente.rol || "").toLowerCase();
        this.isAdmin = apiRoles.includes("admin") || apiSingle === "admin";
      }

      if (!this.agenteId) throw new Error("No se pudo obtener el AgenteId");

      // Cargar datos iniciales
      await this.cargarTodosLosClientes();
    } catch (error) {
      console.error("Error en mounted:", error);
      this.nombreAgente =
        "La sesión ha caducado. Por favor, inicie sesión de nuevo.";
      this.isSessionExpired = true;
      this.startAutoRedirectCountdown();
      return;
    }

    // Inicialización del modal
    const modalElement = document.getElementById("contactModal");
    if (modalElement) {
      this.contactModal = new Modal(modalElement);
    }

    this.checkNotifications();

    // Verificar sesión y suscribirse a cambios
    this.checkSession();
    this.sessionCheckTimer = setInterval(this.checkSession, 30000);
    window.addEventListener("storage", this.onStorage);
  },
  beforeUnmount() {
    if (this.sessionCheckTimer) clearInterval(this.sessionCheckTimer);
    if (this.autoRedirectTimer) clearInterval(this.autoRedirectTimer);
    window.removeEventListener("storage", this.onStorage);
  },

  methods: {
    handleOpenInmueble(payload) {
      console.log("🔄 Padre recibió open-inmueble:", payload);
      
      // Procesar el payload según lo que envía task.vue
      if (typeof payload.value === 'object') {
        // Si es un objeto con slug
        if (payload.value.slug) {
          this.selectedInmuebleSlug = payload.value.slug;
          this.selectedInmuebleId = null;
        } else {
          // Si es el objeto completo de propiedad
          this.selectedInmuebleData = payload.value;
        }
      } else {
        // Si es solo el ID
        this.selectedInmuebleId = payload.value;
      }
      
      this.showInmuebleModal = true;
    },
    closeInmuebleModal() {
      this.showInmuebleModal = false;
      this.selectedInmuebleId = null;
      this.selectedInmuebleSlug = null;
      this.selectedInmuebleData = null;
    },

    // Métodos de paginación
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.currentPage = page;
      }
    },

    nextPage() {
      if (this.pagination.currentPage < this.totalPages) {
        this.pagination.currentPage++;
      }
    },

    prevPage() {
      if (this.pagination.currentPage > 1) {
        this.pagination.currentPage--;
      }
    },

    compartirPorWhatsApp(match) {
  // Obtener datos del cliente
  const cli = this.clientDetails || {};
  const clientName = (cli.nombre || "").toString().trim();
  const shortName = clientName ? clientName.split(" ")[0] : "";
  
  // Obtener datos de la propiedad
  const propiedadTitulo =
    match.tituloPropiedad ||
    match.propiedad?.titulo ||
    "Propiedad " + match.codigoPropiedad;
  const propiedadUrl = this.buildInmuebleUrl(match.propiedad);

  // Construir mensaje igual que en detalleCliente.vue
  const msgBase = `Hola ${
    shortName || clientName || "cliente"
  }, tenemos la siguiente propiedad disponible para usted: ${propiedadTitulo}`;
  
  const fullMsg = propiedadUrl ? `${msgBase}\n${propiedadUrl}` : msgBase;
  const mensajeCodificado = encodeURIComponent(fullMsg);

  // Intentar múltiples campos potenciales de teléfono (igual que en detalleCliente.vue)
  const phoneCandidate =
    cli.telefonoCompleto ||
    cli.telefono ||
    cli.phone ||
    cli.celular ||
    cli.mobile ||
    null;

  const telefonoLimpio = this.formatPhoneForWhatsApp(phoneCandidate);

  const urlWhatsApp = telefonoLimpio
    ? `https://wa.me/${telefonoLimpio}?text=${mensajeCodificado}`
    : `https://wa.me/?text=${mensajeCodificado}`;

  // Abrir en nueva pestaña
  window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
},

// Agregar el método auxiliar para formatear teléfono (igual que en detalleCliente.vue)
formatPhoneForWhatsApp(phone) {
  if (!phone) return null;
  
  // Limpiar el teléfono (remover espacios, guiones, etc.)
  const cleaned = phone.toString().replace(/\D/g, "");
  
  // Si el número ya tiene código de país, retornarlo tal cual
  if (cleaned.startsWith('1') || cleaned.startsWith('52') || cleaned.startsWith('51') || 
      cleaned.startsWith('57') || cleaned.startsWith('58') || cleaned.length >= 11) {
    return cleaned;
  }
  
  // Si es un número local (sin código de país), asumir Guatemala (+502)
  if (cleaned.length === 8) {
    return '502' + cleaned;
  }
  
  return cleaned;
},

    verDetallesPropiedad(match) {
  const prop = match.propiedad || {
    titulo: match.tituloPropiedad || "Propiedad " + match.codigoPropiedad,
    codigo: match.codigoPropiedad,
  };

  this.openInmuebleModal(prop);
},

// Actualizar openInmuebleModal para que sea igual a detalleCliente.vue
openInmuebleModal(prop) {
  const id = prop?.id ?? prop?.__raw?.id ?? null;
  const slug = prop?.slugInmueble || prop?.slug || prop?.slugProyecto || null;

  console.log("🔍 [task] openInmuebleModal - Prop:", prop);
  console.log("🔍 [task] openInmuebleModal - ID:", id, "Tipo:", typeof id);
  console.log("🔍 [task] openInmuebleModal - Slug:", slug);

  // CERRAR PRIMERO EL MODAL DE CONTACTO
  this.closeContactModal();

  // Pequeño delay para que se cierre el modal antes de abrir el nuevo
  setTimeout(() => {
    // Emisión estructurada: { value, source } — igual que en detalleCliente.vue
    if (id) {
      this.$emit("open-inmueble", { value: id, source: "task" });
      console.debug("📤 [task] -> emit open-inmueble (id):", id);
      return;
    }

    if (slug) {
      this.$emit("open-inmueble", { value: { slug }, source: "task" });
      console.debug("📤 [task] -> emit open-inmueble (slug):", slug);
      return;
    }

    this.$emit("open-inmueble", { value: prop, source: "task" });
    console.debug("📤 [task] -> emit open-inmueble (obj):", prop);
  }, 100);
},

    // Modificar el método marcarComoEnviado para que funcione con checkbox
    async marcarComoEnviado(matchId) {
      try {
        // Encontrar el match en pendientes
        const matchIndex = this.matchesPendientes.findIndex(
          (m) => m.id === matchId
        );
        if (matchIndex === -1) {
          console.warn("Match no encontrado en pendientes:", matchId);
          return;
        }

        const matchToMove = { ...this.matchesPendientes[matchIndex] };

        console.log("Moviendo match a enviados:", matchToMove);

        const result = await matchService.marcarComoEnviado(matchId);

        if (result && (result.ok || result.status === 200 || result.success)) {
          // 1. Remover de pendientes
          this.matchesPendientes.splice(matchIndex, 1);

          // 2. Agregar a enviados con fecha actual
          matchToMove.fechaEnvio = new Date().toISOString();
          this.matchesEnviados.unshift(matchToMove);

          // 3. Forzar reactividad
          this.matchesPendientes = [...this.matchesPendientes];
          this.matchesEnviados = [...this.matchesEnviados];

          Swal.fire({
            icon: "success",
            title: "¡Match Enviado!",
            text: "El match ha sido marcado como enviado.",
            timer: 1500,
            showConfirmButton: false,
          });

          // ✅ FORZAR RECARGA para obtener nuevos matches pendientes
          // Esto asegura que se carguen propiedades nuevas que coincidan
          await this.forceLoadClientDetails();
        } else {
          throw new Error(
            result.error?.message || "Error desconocido al enviar el match."
          );
        }
      } catch (error) {
        console.error("Error al marcar el match como enviado:", error);
        Swal.fire({
          icon: "error",
          title: "Error de Envío",
          text: "No se pudo marcar el match como enviado.",
        });

        // En caso de error, recargar para sincronizar
        await this.forceLoadClientDetails();
      }
    },
    formatDateTime(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return date.toLocaleDateString("es-ES", options);
    },

    async eliminarMatch(matchId, tipo) {
      const confirm = await Swal.fire({
        title: `¿Eliminar match ${tipo}?`,
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;

      try {
        await matchService.deleteMatch(matchId);
        Swal.fire("Eliminado", "El match fue eliminado.", "success");

        // Actualizar la lista correspondiente
        if (tipo === "pendiente") {
          this.matchesPendientes = this.matchesPendientes.filter(
            (m) => m.id !== matchId
          );
        } else {
          this.matchesEnviados = this.matchesEnviados.filter(
            (m) => m.id !== matchId
          );
        }
      } catch (error) {
        console.error("Error al eliminar match:", error);
        Swal.fire("Error", "No se pudo eliminar el match.", "error");
      }
    },
    // =========================================================
    // ✅ FUNCIONES DE UTILIDAD PARA URLS (MOVidas a methods)
    stripTrailingSlash(u) {
      return (u || "").replace(/\/+$/, "");
    },
    buildInmuebleUrl(prop) {
      const siteOrigin =
        import.meta.env.VITE_PUBLIC_SITE_ORIGIN ||
        (typeof window !== "undefined"
          ? window.location.origin
          : "https://tu-dominio.com");
      // Usar slugInmueble o slug, como en detalleCliente.vue
      const slug = prop?.slugInmueble || prop?.slug || "";
      if (!slug) return "";
      return `${this.stripTrailingSlash(siteOrigin)}/inmueble/${slug}`;
    },
    // =========================================================
    async loadClientDetails() {
      if (!this.selectedTask?.clienteId) return;

      this.isLoadingDetails = true;
      try {
        const clienteId = this.selectedTask.clienteId;

        // Cargar Cliente y Preferencias
        const clientFullResponse = await clienteService.getClienteById(
          clienteId
        );

        // Normalizar la respuesta
        this.clientDetails = clientFullResponse?.$values
          ? clientFullResponse.$values[0]
          : clientFullResponse;

        // Extraer preferencias
        const preferenciasArray =
          this.clientDetails?.preferencias?.$values ||
          this.clientDetails?.Preferencias?.$values ||
          [];

        if (preferenciasArray && preferenciasArray.length > 0) {
          this.preferencias = preferenciasArray[0];
          // Normalizar nombres de propiedades para consistencia
          this.preferencias = {
            tipo: this.preferencias.tipo || this.preferencias.tipoPropiedad,
            operacion:
              this.preferencias.operacion ||
              this.preferencias.operacionPreferida,
            precioMin:
              this.preferencias.precioMin || this.preferencias.rangoPrecioMin,
            precioMax:
              this.preferencias.precioMax || this.preferencias.rangoPrecioMax,
            habitaciones: this.preferencias.habitaciones,
            banos: this.preferencias.banos,
            ubicacion: this.preferencias.ubicacion,
            metrosCuadrados: this.preferencias.metrosCuadrados,
            amenidades: this.preferencias.amenidades || [],
          };
        } else {
          this.preferencias = null;
        }

        // Cargar Matches
        const [pendientesResponse, enviadosResponse] = await Promise.all([
          matchService.getPendientesByCliente(clienteId),
          matchService.getEnviadosByCliente(clienteId),
        ]);

        // Normalizar respuestas
        this.matchesPendientes =
          pendientesResponse?.$values || pendientesResponse || [];
        this.matchesEnviados =
          enviadosResponse?.$values || enviadosResponse || [];

        // ENRIQUECER MATCHES CON DATOS DE PROPIEDAD USANDO EL inmuebleId
        await this.enriquecerMatchesConPropiedades();
      } catch (error) {
        console.error("Error al cargar detalles del cliente:", error);
        Swal.fire({
          icon: "error",
          title: "Error de Carga",
          text: "No se pudieron cargar los detalles del cliente o los matches.",
        });
      } finally {
        this.isLoadingDetails = false;
      }
    },

    // MÉTODO CORREGIDO PARA ENRIQUECER MATCHES
    async enriquecerMatchesConPropiedades() {
      try {
        console.log("🔄 Enriqueciendo matches con propiedades...");

        let propiedadesCargadas = 0;
        let propiedadesNoEncontradas = 0;

        // Para matches pendientes
        for (let match of this.matchesPendientes) {
          console.log(`🔍 Procesando match pendiente ${match.id}:`, {
            inmuebleId: match.inmuebleId,
            codigoPropiedad: match.codigoPropiedad,
            tienePropiedad: !!match.propiedad,
          });

          // Si ya tiene propiedad, saltar
          if (match.propiedad) {
            console.log(`✅ Match ${match.id} ya tiene propiedad`);
            continue;
          }

          // Intentar por inmuebleId primero
          if (match.inmuebleId) {
            try {
              console.log(
                `📡 Buscando propiedad por inmuebleId: ${match.inmuebleId}`
              );
              const propiedadData = await inmuebleService.getInmuebleById(
                match.inmuebleId
              );

              if (propiedadData) {
                match.propiedad = propiedadData?.$values?.[0] || propiedadData;
                propiedadesCargadas++;
                console.log(
                  `✅ Propiedad encontrada por inmuebleId para match ${match.id}`
                );
              } else {
                console.warn(
                  `❌ No se encontró propiedad con inmuebleId: ${match.inmuebleId}`
                );
                propiedadesNoEncontradas++;
              }
            } catch (error) {
              console.error(
                `❌ Error buscando por inmuebleId ${match.inmuebleId}:`,
                error
              );
            }
          }

          // Si no se encontró por inmuebleId, intentar por código de propiedad
          if (!match.propiedad && match.codigoPropiedad) {
            try {
              console.log(
                `📡 Buscando propiedad por código: ${match.codigoPropiedad}`
              );
              const propiedadData =
                await inmuebleService.getInmuebleByCodigoPropiedad(
                  match.codigoPropiedad
                );

              if (propiedadData) {
                match.propiedad = propiedadData;
                propiedadesCargadas++;
                console.log(
                  `✅ Propiedad encontrada por código para match ${match.id}`
                );
              } else {
                console.warn(
                  `❌ No se encontró propiedad con código: ${match.codigoPropiedad}`
                );
                propiedadesNoEncontradas++;
              }
            } catch (error) {
              console.error(
                `❌ Error buscando por código ${match.codigoPropiedad}:`,
                error
              );
            }
          }

          // Si aún no tiene propiedad, crear un objeto básico
          if (!match.propiedad) {
            console.warn(`⚠️ Creando propiedad básica para match ${match.id}`);
            match.propiedad = {
              id: match.inmuebleId,
              codigoPropiedad: match.codigoPropiedad,
              titulo:
                match.tituloPropiedad ||
                "Propiedad " + (match.codigoPropiedad || match.inmuebleId),
            };
          }
        }

        // MISMA LÓGICA PARA MATCHES ENVIADOS
        for (let match of this.matchesEnviados) {
          console.log(`🔍 Procesando match enviado ${match.id}:`, {
            inmuebleId: match.inmuebleId,
            codigoPropiedad: match.codigoPropiedad,
            tienePropiedad: !!match.propiedad,
          });

          if (match.propiedad) continue;

          if (match.inmuebleId) {
            try {
              console.log(
                `📡 Buscando propiedad por inmuebleId: ${match.inmuebleId}`
              );
              const propiedadData = await inmuebleService.getInmuebleById(
                match.inmuebleId
              );

              if (propiedadData) {
                match.propiedad = propiedadData?.$values?.[0] || propiedadData;
                propiedadesCargadas++;
                console.log(
                  `✅ Propiedad encontrada por inmuebleId para match ${match.id}`
                );
              }
            } catch (error) {
              console.error(
                `❌ Error buscando por inmuebleId ${match.inmuebleId}:`,
                error
              );
            }
          }

          if (!match.propiedad && match.codigoPropiedad) {
            try {
              console.log(
                `📡 Buscando propiedad por código: ${match.codigoPropiedad}`
              );
              const propiedadData =
                await inmuebleService.getInmuebleByCodigoPropiedad(
                  match.codigoPropiedad
                );

              if (propiedadData) {
                match.propiedad = propiedadData;
                propiedadesCargadas++;
                console.log(
                  `✅ Propiedad encontrada por código para match ${match.id}`
                );
              }
            } catch (error) {
              console.error(
                `❌ Error buscando por código ${match.codigoPropiedad}:`,
                error
              );
            }
          }

          if (!match.propiedad) {
            console.warn(`⚠️ Creando propiedad básica para match ${match.id}`);
            match.propiedad = {
              id: match.inmuebleId,
              codigoPropiedad: match.codigoPropiedad,
              titulo:
                match.tituloPropiedad ||
                "Propiedad " + (match.codigoPropiedad || match.inmuebleId),
            };
          }
        }

        console.log(
          `🎯 Resumen - Propiedades cargadas: ${propiedadesCargadas}, No encontradas: ${propiedadesNoEncontradas}`
        );
      } catch (error) {
        console.error("❌ Error general al enriquecer matches:", error);
      }
    },
    // Asegurarnos de que el método verDetallesPropiedad funcione para ambos tipos de matches
    verDetallesPropiedad(match) {
      console.log("🖱️ Click en Ver Detalles - Match:", {
        id: match.id,
        inmuebleId: match.inmuebleId,
        codigoPropiedad: match.codigoPropiedad,
        propiedad: match.propiedad,
      });

      const prop = match.propiedad;

      if (!prop) {
        console.warn("❌ No hay datos de propiedad disponibles");

        // FALLBACK MEJORADO: Crear objeto básico con la información disponible
        const fallbackProp = {
          id: match.inmuebleId,
          codigoPropiedad: match.codigoPropiedad,
          titulo: match.tituloPropiedad || "Propiedad " + match.codigoPropiedad,
        };

        console.log("🔄 Usando fallback con:", fallbackProp);
        this.openInmuebleModal(fallbackProp);
        return;
      }

      console.log("🔍 Propiedad para abrir modal:", prop);
      this.openInmuebleModal(prop);
    },

    openInmuebleModal(prop) {
      // EXACTAMENTE IGUAL QUE EN detalleCliente.vue
      const id = prop?.id ?? prop?.__raw?.id ?? null;
      const slug =
        prop?.slugInmueble || prop?.slug || prop?.slugProyecto || null;

      console.log("🔍 [task] openInmuebleModal - Prop:", prop);
      console.log("🔍 [task] openInmuebleModal - ID:", id, "Tipo:", typeof id);
      console.log("🔍 [task] openInmuebleModal - Slug:", slug);

      // Emisión estructurada: { value, source } — igual que en detalleCliente.vue
      if (id) {
        this.$emit("open-inmueble", { value: id, source: "task" });
        console.debug("📤 [task] -> emit open-inmueble (id):", id);
        return;
      }

      if (slug) {
        this.$emit("open-inmueble", { value: { slug }, source: "task" });
        console.debug("📤 [task] -> emit open-inmueble (slug):", slug);
        return;
      }

      this.$emit("open-inmueble", { value: prop, source: "task" });
      console.debug("📤 [task] -> emit open-inmueble (obj):", prop);
    },

    // Helper para extraer datos de propiedad del match
    getPropiedadFromMatch(match) {
      if (match.propiedad) return match.propiedad;

      // Intentar extraer de data si está disponible
      if (match.data) {
        try {
          const data =
            typeof match.data === "string"
              ? JSON.parse(match.data)
              : match.data;
          return {
            titulo: data.titulo || data.title,
            slugInmueble: data.slugInmueble || data.slug,
          };
        } catch (e) {
          return null;
        }
      }

      return null;
    },

    // Método para marcar como enviado
    async marcarComoEnviado(matchId) {
      try {
        // Encontrar el match en pendientes
        const matchIndex = this.matchesPendientes.findIndex(
          (m) => m.id === matchId
        );
        if (matchIndex === -1) {
          console.warn("Match no encontrado en pendientes:", matchId);
          return;
        }

        const matchToMove = { ...this.matchesPendientes[matchIndex] };

        console.log("Moviendo match a enviados:", matchToMove);

        const result = await matchService.marcarComoEnviado(matchId);

        if (result && (result.ok || result.status === 200 || result.success)) {
          // 1. Remover de pendientes
          this.matchesPendientes.splice(matchIndex, 1);

          // 2. Agregar a enviados con fecha actual
          matchToMove.fechaEnvio = new Date().toISOString();
          this.matchesEnviados.unshift(matchToMove); // Agregar al inicio

          // 3. Forzar reactividad
          this.matchesPendientes = [...this.matchesPendientes];
          this.matchesEnviados = [...this.matchesEnviados];

          Swal.fire({
            icon: "success",
            title: "¡Match Enviado!",
            text: "El match ha sido marcado como enviado.",
            timer: 1500,
            showConfirmButton: false,
          });

          // ✅ NO recargar loadClientDetails() - mantenemos el estado local
        } else {
          throw new Error(
            result.error?.message || "Error desconocido al enviar el match."
          );
        }
      } catch (error) {
        console.error("Error al marcar el match como enviado:", error);
        Swal.fire({
          icon: "error",
          title: "Error de Envío",
          text: "No se pudo marcar el match como enviado.",
        });

        // Solo en caso de error, recargar para sincronizar
        await this.loadClientDetails();
      }
    },

    openAddModal() {
      this.showAddModal = true;
    },
    // Helper para búsqueda acento-insensible y lowercase (igual que en recordatorios)
    normalizeSearch(str) {
      if (!str && str !== 0) return "";
      return String(str)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    },
    parseFilterDate(str, end = false) {
      if (!str) return null;
      const [y, m, d] = str.split("-").map(Number);
      return end
        ? new Date(y, m - 1, d, 23, 59, 59, 999)
        : new Date(y, m - 1, d, 0, 0, 0, 0);
    },
    getTasksByStatus(estado) {
      return this.tasks.filter((task) => task.status === estado);
    },
    getFilteredTasksByStatus(estado) {
      return this.filteredTasks
        .filter((task) => task.status === estado)
        .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)); // Ordenar por fecha de registro (más reciente primero)
    },
    async handleTaskMove(evt, newEstado) {
      if (evt.added) {
        const task = evt.added.element;
        task.status = newEstado; // Actualizar el estado en el objeto de la tarea
        // Usar openContactModal para mantener la consistencia en la carga de datos
        await this.openContactModal(task);
        // Actualizar datos específicos del movimiento después de cargar los detalles
        this.contactData.tipo = "movimiento";
        this.contactData.nota = `Movido a: ${newEstado}`;
        this.contactData.fechaVencimiento = "";
      }
    },
    updateTaskStatus(taskId, newEstado) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = newEstado;
        this.scheduleNotification(task);
      }
    },
    async openContactModal(task) {
      console.log("🔄 [1] INICIANDO openContactModal para cliente:", task.id);

      // SOLUCIÓN RADICAL: Resetear completamente el estado
      await this.resetModalState();

      this.originalStatus = task.status;
      this.selectedTask = { ...task };
      this.selectedTask.clienteId = task.clienteId || task.id;

      console.log("🔄 [2] SelectedTask configurado:", this.selectedTask.id);

      // Configurar datos básicos del modal
      this.selectedTask.Interacciones = Array.isArray(task.Interacciones)
        ? task.Interacciones
        : [];

      const statusKey = Object.keys(statusMap).find(
        (k) => statusMap[k] === this.selectedTask.status
      );
      this.currentRecordatorio.estadoInteraccionRaw = statusKey
        ? parseInt(statusKey)
        : null;

      if (this.selectedTask.Interacciones.length) {
        const last =
          this.selectedTask.Interacciones[
            this.selectedTask.Interacciones.length - 1
          ];
        this.contactData.tipo = last.Tipo || "llamada";
        this.contactData.nota = last.Descripcion || "";
        this.contactData.fechaVencimiento = last.FechaVencimiento
          ? new Date(last.FechaVencimiento).toISOString().slice(0, 16)
          : "";
      } else {
        this.contactData = {
          tipo: "llamada",
          nota: this.selectedTask.nota || this.selectedTask.Notas || "",
          fechaVencimiento: "",
        };
      }

      console.log("🔄 [3] Abriendo modal...");

      // ABRIR EL MODAL
      this.contactModal.show();

      console.log("🔄 [4] Modal abierto, cargando detalles...");

      // CARGAR DETALLES
      await this.forceLoadClientDetails();

      console.log("🔄 [5] openContactModal COMPLETADO");
    },

    // NUEVO MÉTODO: Reset completo del estado del modal
    async resetModalState() {
      console.log("🔄 Reseteando estado del modal...");

      // Cerrar modal si está abierto
      this.contactModal?.hide?.();

      // Limpiar todos los datos reactivos
      this.selectedTask = null;
      this.originalStatus = null;
      this.clientDetails = null;
      this.matchesPendientes = [];
      this.matchesEnviados = [];
      this.preferencias = null;
      this.currentRecordatorio.estadoInteraccionRaw = null;
      this.contactData = { tipo: "llamada", nota: "", fechaVencimiento: "" };
      this.isLoadingDetails = false;
      this.pagination.currentPage = 1;

      // Pequeño delay para asegurar que Vue procese los cambios
      await new Promise((resolve) => setTimeout(resolve, 50));

      console.log("🔄 Estado del modal reseteado");
    },

    // Nuevo método para forzar recarga
    async forceLoadClientDetails() {
      if (!this.selectedTask?.clienteId) {
        console.error("❌ No hay clienteId para cargar detalles");
        return;
      }

      this.isLoadingDetails = true;
      try {
        const clienteId = this.selectedTask.clienteId;
        console.log("🔄 Forzando recarga de matches para cliente:", clienteId);

        // 1. PRIMERO: Cargar cliente y preferencias
        const clientFullResponse = await clienteService.getClienteById(
          clienteId
        );

        // Normalizar la respuesta del cliente
        this.clientDetails = clientFullResponse?.$values
          ? clientFullResponse.$values[0]
          : clientFullResponse;

        console.log("👤 Cliente cargado:", this.clientDetails?.nombre);

        // Extraer preferencias
        const preferenciasArray =
          this.clientDetails?.preferencias?.$values ||
          this.clientDetails?.Preferencias?.$values ||
          [];

        if (preferenciasArray && preferenciasArray.length > 0) {
          this.preferencias = preferenciasArray[0];
          this.preferencias = {
            tipo: this.preferencias.tipo || this.preferencias.tipoPropiedad,
            operacion:
              this.preferencias.operacion ||
              this.preferencias.operacionPreferida,
            precioMin:
              this.preferencias.precioMin || this.preferencias.rangoPrecioMin,
            precioMax:
              this.preferencias.precioMax || this.preferencias.rangoPrecioMax,
            habitaciones: this.preferencias.habitaciones,
            banos: this.preferencias.banos,
            ubicacion: this.preferencias.ubicacion,
            metrosCuadrados: this.preferencias.metrosCuadrados,
            amenidades: this.preferencias.amenidades || [],
          };
          console.log("🎯 Preferencias cargadas:", this.preferencias);
        } else {
          this.preferencias = null;
          console.log("❌ No hay preferencias");
          // Sin preferencias, no podemos generar matches
          this.matchesPendientes = [];
          this.matchesEnviados = [];
          return;
        }

        // 2. SEGUNDO: BUSCAR PROPIEDADES QUE COINCIDAN CON PREFERENCIAS
        console.log(
          "🔄 Buscando propiedades que coincidan con preferencias..."
        );

        let propiedadesCoincidentes = [];
        try {
          // Obtener todas las propiedades - CORREGIDO PARA MANEJAR PAGINACIÓN
          const todasLasPropiedades = await inmuebleService.getInmueble();
          console.log("📊 Respuesta de getInmueble:", todasLasPropiedades);

          // Manejar formato de respuesta paginada
          let propiedadesArray = [];

          // Si items es un objeto con $values (formato común en esta API)
          if (
            todasLasPropiedades?.items?.$values &&
            Array.isArray(todasLasPropiedades.items.$values)
          ) {
            propiedadesArray = todasLasPropiedades.items.$values;
            console.log("📦 Propiedades extraídas de items.$values");
          }
          // Si items es directamente un array
          else if (
            todasLasPropiedades?.items &&
            Array.isArray(todasLasPropiedades.items)
          ) {
            propiedadesArray = todasLasPropiedades.items;
            console.log("📦 Propiedades extraídas de items (array)");
          }
          // Si la respuesta es directamente un array
          else if (Array.isArray(todasLasPropiedades)) {
            propiedadesArray = todasLasPropiedades;
            console.log(
              "📦 Propiedades extraídas de respuesta directa (array)"
            );
          }
          // Si tiene $values en la raíz
          else if (
            todasLasPropiedades?.$values &&
            Array.isArray(todasLasPropiedades.$values)
          ) {
            propiedadesArray = todasLasPropiedades.$values;
            console.log("📦 Propiedades extraídas de $values");
          } else {
            console.warn(
              "⚠️ Formato de respuesta de propiedades no reconocido:",
              todasLasPropiedades
            );
            // Intentar extraer propiedades de cualquier manera
            if (
              todasLasPropiedades?.items &&
              typeof todasLasPropiedades.items === "object"
            ) {
              // Convertir objeto a array si es necesario
              propiedadesArray = Object.values(todasLasPropiedades.items);
              console.log(
                "📦 Propiedades extraídas convirtiendo objeto a array"
              );
            } else {
              propiedadesArray = [];
            }
          }

          console.log(
            "🏠 Total de propiedades disponibles:",
            propiedadesArray.length
          );

          // Filtrar propiedades que coincidan con las preferencias
          if (propiedadesArray.length > 0) {
            propiedadesCoincidentes = propiedadesArray.filter((propiedad) =>
              this.coincideConPreferencias(propiedad, this.preferencias)
            );

            console.log(
              "🎯 Propiedades que coinciden con preferencias:",
              propiedadesCoincidentes.length
            );

            // DEBUG: Mostrar algunas propiedades encontradas
            if (propiedadesCoincidentes.length > 0) {
              console.log(
                "🔍 Primeras propiedades coincidentes:",
                propiedadesCoincidentes.slice(0, 3).map((p) => ({
                  codigo: p.codigoPropiedad,
                  tipo: p.tipos,
                  operacion: p.operaciones,
                  precio: p.precio,
                }))
              );
            }
          } else {
            console.log("❌ No se encontraron propiedades");
          }
        } catch (error) {
          console.error("❌ Error buscando propiedades:", error);
          propiedadesCoincidentes = [];
        }

        // 3. TERCERO: CREAR MATCHES EN LA BASE DE DATOS
        if (propiedadesCoincidentes.length > 0) {
          console.log("🔄 Creando matches en la base de datos...");

          const matchesCreados = [];

          for (const propiedad of propiedadesCoincidentes) {
            try {
              // Verificar que la propiedad tenga los datos necesarios
              if (!propiedad.id || !propiedad.codigoPropiedad) {
                console.warn(
                  `⚠️ Propiedad sin ID o código, saltando:`,
                  propiedad
                );
                continue;
              }

              const matchPayload = {
                id: 0, // 0 para auto-increment
                clienteId: clienteId,
                codigoPropiedad: propiedad.codigoPropiedad,
                inmuebleId: propiedad.id,
                esEnviado: false, // Por defecto pendiente
                fechaEnvio: null, // Solo se llena cuando se envía
              };

              console.log(
                `📤 Creando match para propiedad: ${propiedad.codigoPropiedad}`
              );
              const matchCreado = await matchService.createMatch(matchPayload);

              if (matchCreado) {
                matchesCreados.push(matchCreado);
                console.log(`✅ Match creado: ${matchCreado.id}`);
              } else {
                console.warn(
                  `⚠️ No se pudo crear match para ${propiedad.codigoPropiedad}`
                );
              }
            } catch (error) {
              console.error(
                `❌ Error creando match para ${propiedad.codigoPropiedad}:`,
                error
              );
              // Continuar con la siguiente propiedad
            }
          }

          console.log(
            `📊 Matches creados exitosamente: ${matchesCreados.length}`
          );

          // Pequeña pausa para asegurar que los matches se guarden en la BD
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          console.log(
            "❌ No hay propiedades que coincidan con las preferencias"
          );
        }

        // 4. CUARTO: OBTENER MATCHES PENDIENTES Y ENVIADOS (AHORA DEBERÍAN EXISTIR)
        console.log("🔄 Obteniendo matches de la base de datos...");

        const [pendientesResponse, enviadosResponse] = await Promise.allSettled(
          [
            matchService.getPendientesByCliente(clienteId),
            matchService.getEnviadosByCliente(clienteId),
          ]
        );

        // Procesar matches pendientes
        if (pendientesResponse.status === "fulfilled") {
          this.matchesPendientes =
            pendientesResponse.value?.$values || pendientesResponse.value || [];
          console.log(
            "📦 Matches pendientes cargados:",
            this.matchesPendientes.length
          );
        } else {
          console.error(
            "❌ Error cargando matches pendientes:",
            pendientesResponse.reason
          );
          this.matchesPendientes = [];
        }

        // Procesar matches enviados
        if (enviadosResponse.status === "fulfilled") {
          this.matchesEnviados =
            enviadosResponse.value?.$values || enviadosResponse.value || [];
          console.log(
            "📦 Matches enviados cargados:",
            this.matchesEnviados.length
          );
        } else {
          console.error(
            "❌ Error cargando matches enviados:",
            enviadosResponse.reason
          );
          this.matchesEnviados = [];
        }

        // 5. ENRIQUECER MATCHES CON DATOS DE PROPIEDAD
        if (
          this.matchesPendientes.length > 0 ||
          this.matchesEnviados.length > 0
        ) {
          await this.enriquecerMatchesConPropiedades();
          console.log("✅ Matches enriquecidos con propiedades");
        }
      } catch (error) {
        console.error("❌ Error general en forceLoadClientDetails:", error);
        Swal.fire({
          icon: "error",
          title: "Error de Carga",
          text: "No se pudieron cargar los detalles del cliente.",
        });
      } finally {
        this.isLoadingDetails = false;
        console.log("🏁 Carga de detalles completada");
      }
    },

    // MÉTODO AUXILIAR: Comparar propiedad con preferencias
    coincideConPreferencias(propiedad, preferencias) {
      // Lógica básica de matching - ajusta según tus necesidades
      if (preferencias.tipo && propiedad.tipos !== preferencias.tipo)
        return false;
      if (
        preferencias.operacion &&
        propiedad.operaciones !== preferencias.operacion
      )
        return false;

      // Precio
      if (preferencias.precioMin && propiedad.precio < preferencias.precioMin)
        return false;
      if (preferencias.precioMax && propiedad.precio > preferencias.precioMax)
        return false;

      // Habitaciones
      if (
        preferencias.habitaciones &&
        propiedad.habitaciones < preferencias.habitaciones
      )
        return false;

      // Baños
      if (preferencias.banos && propiedad.banos < preferencias.banos)
        return false;

      // Ubicación (búsqueda parcial)
      if (preferencias.ubicacion && propiedad.ubicaciones) {
        const ubicacionProp = propiedad.ubicaciones.toLowerCase();
        const ubicacionPref = preferencias.ubicacion.toLowerCase();
        if (!ubicacionProp.includes(ubicacionPref)) return false;
      }

      return true;
    },
    closeContactModal() {
      // si hubo un drag (o cambio) y no se guardó, revertir status real
      if (this.selectedTask && this.originalStatus != null) {
        const idx = this.tasks.findIndex((t) => t.id === this.selectedTask.id);
        if (idx > -1) {
          this.tasks[idx].status = this.originalStatus;
        }
      }

      // Limpiar todos los datos del modal
      this.selectedTask = null;
      this.originalStatus = null;
      this.clientDetails = null;
      this.matchesPendientes = [];
      this.matchesEnviados = [];
      this.preferencias = null;
      this.currentRecordatorio.estadoInteraccionRaw = null;
      this.contactData = { tipo: "llamada", nota: "", fechaVencimiento: "" };
      this.isLoadingDetails = false;

      this.contactModal?.hide?.();
    },
    async saveContact() {
      if (!this.selectedTask) return;
      if (!this.agenteId) {
        Swal.fire({
          icon: "error",
          title: "Sin sesión activa",
          text: "No se puede guardar sin un agente autenticado.",
        });
        return;
      }

      try {
        // 1. Convertir el estado al formato esperado por el backend
        const estadoNumerico = Object.keys(statusMap).find(
          (key) => statusMap[key] === this.selectedTask.status
        );

        if (!estadoNumerico) {
          throw new Error("El estado seleccionado no es válido.");
        }

        const patchPayload = {
          Status: parseInt(estadoNumerico), // Asegurarse de enviar un número
        };

        // 2. Actualizar el estado del cliente
        await clienteService.patchCliente(this.selectedTask.id, patchPayload);

        // 3. Registrar la nueva interacción
        const nuevaInteraccion = {
          fecha: new Date().toISOString(),
          fechaVencimiento: this.contactData.fechaVencimiento
            ? new Date(this.contactData.fechaVencimiento).toISOString()
            : null,
          tipo: this.contactData.tipo,
          descripcion: this.contactData.nota,
          clienteId: this.selectedTask.id,
          agenteId: this.agenteId,
          statusInteraccion: this.selectedTask.status,
        };
        await interaccionService.addInteraccion(nuevaInteraccion);

        if (!this.selectedTask.Interacciones)
          this.selectedTask.Interacciones = [];
        this.selectedTask.Interacciones.push(nuevaInteraccion);

        // Actualizar el estado de la tarjeta en la lista `tasks`
        const index = this.tasks.findIndex(
          (t) => t.id === this.selectedTask.id
        );
        if (index > -1) {
          this.tasks[index].status = this.selectedTask.status; // aplicar el nuevo estado
          this.tasks[index].nota = nuevaInteraccion.descripcion;
          this.tasks[index].Interacciones = [
            ...this.selectedTask.Interacciones,
          ];
        }

        // Mover la tarjeta a la columna correspondiente
        this.tasks = [...this.tasks]; // Forzar reactividad en la lista

        this.originalStatus = null; // limpiar ya que se confirmó

        Swal.fire({
          icon: "success",
          title: "Guardado",
          text: "Estado e interacción actualizados correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });

        if (this.contactData.fechaVencimiento)
          this.scheduleNotification(this.selectedTask);
      } catch (error) {
        // Depurar el error para identificar la causa
        console.error("❌ Error al guardar:", error);

        // Mostrar un mensaje más informativo al usuario
        const errorMessage = error?.message || "Ocurrió un error inesperado.";
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `No se pudo actualizar el cliente o registrar la interacción: ${errorMessage}`,
        });
      }
      this.closeContactModal();
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return new Date(dateString).toLocaleDateString("es-ES", options);
    },
    formatStatusForDisplay(value) {
      return (value || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    },
    scheduleNotification(task) {
      if (!("Notification" in window)) return;
      const last = task.Interacciones?.length
        ? task.Interacciones[task.Interacciones.length - 1]
        : null;
      if (last?.FechaVencimiento) {
        const timeout = new Date(last.FechaVencimiento) - new Date();
        if (timeout > 0) {
          setTimeout(() => {
            if (Notification.permission === "granted") {
              new Notification(`Recordatorio: ${task.nombre}`, {
                body: `Tienes un seguimiento pendiente.`,
                icon: "/favicon.ico",
              });
            }
          }, timeout);
        }
      }
    },
    checkNotifications() {
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    },

    // ===================== AQUÍ SE FILTRA POR ROL =====================
    async cargarTodosLosClientes() {
      try {
        const response = await clienteService.getAllClientes();
        const clientes = response?.$values || [];

        // Cargar agentes para mapear nombres
        let agentesMap = new Map();
        try {
          const agentesResp = await agenteService.getUsers();
          const agentesRaw = agentesResp?.$values || agentesResp || [];
          agentesRaw.forEach((ag) => {
            const id = ag.Id || ag.id || ag.userId || ag.usuarioId;
            agentesMap.set(id, ag);
          });
        } catch (e) {
          agentesMap = new Map();
        }

        // Filtrar: admin => todos; no admin => solo clientes del agente
        const filtrados = this.isAdmin
          ? clientes
          : clientes.filter((c) => {
              const cid =
                c.AgenteId ||
                c.agenteId ||
                c.Agente?.Id ||
                c.agente?.Id ||
                c.agente?.id;
              return cid === this.agenteId;
            });

        // Reiniciar tasks antes de llenar
        this.tasks = [];

        filtrados.forEach((rawCliente) => {
          const agenteIdVal =
            rawCliente.AgenteId || rawCliente.agenteId || null;
          const agenteObj = agentesMap.get(agenteIdVal) || {};
          const agenteNombre = agenteObj.Nombre || agenteObj.nombre || "";
          const agenteApellido = agenteObj.Apellido || agenteObj.apellido || "";
          const task = {
            id: rawCliente.Id || rawCliente.id,
            agenteId: rawCliente.AgenteId || rawCliente.agenteId || null, // Guardamos para referencia
            agenteNombre: agenteNombre,
            agenteApellido: agenteApellido,
            nombre: rawCliente.Nombre || rawCliente.nombre || "",
            apellido: rawCliente.Apellido || rawCliente.apellido || "",
            dni: rawCliente.Dni || rawCliente.dni || "",
            telefono: rawCliente.Telefono || rawCliente.telefono || "",
            email: rawCliente.Email || rawCliente.email || "",
            origen: rawCliente.Origen || rawCliente.origen || "",
            nota: rawCliente.Notas || rawCliente.nota || "",
            fechaRegistro:
              rawCliente.FechaRegistro ||
              rawCliente.fechaRegistro ||
              new Date().toISOString(),
            // Extraer interacciones desde interacciones.$values
            Interacciones: rawCliente.interacciones?.$values || [],
            Preferencias: rawCliente.Preferencias,
            status:
              statusMap[rawCliente.Status] ||
              statusMap[rawCliente.status] ||
              "contacto_inicial_pendiente",
          };
          this.tasks.push(task);
        });

        // Cargar todos los agentes (solo si es admin)
        if (this.isAdmin) {
          this.agentesArray = Array.from(agentesMap.values()).map((ag) => ({
            id: ag.Id || ag.id || ag.userId || ag.usuarioId,
            nombre: ag.Nombre || ag.nombre || "",
            apellido: ag.Apellido || ag.apellido || "",
          }));
        } else {
          // Si no es admin, cargar solo el propio agente
          const propioAgente = agentesMap.get(this.agenteId) || {};
          this.agentesArray = [
            {
              id:
                propioAgente.Id ||
                propioAgente.id ||
                propioAgente.userId ||
                propioAgente.usuarioId,
              nombre: propioAgente.Nombre || propioAgente.nombre || "",
              apellido: propioAgente.Apellido || propioAgente.apellido || "",
            },
          ];
        }
      } catch (error) {
        //console.error("❌ Error al cargar clientes:", error?.message || error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los clientes desde la API.",
          confirmButtonText: "Aceptar",
        });
      }
    },
    // ==================================================================

    handleClientAdded(newClient) {
      this.tasks.push({
        id: Date.now(),
        ...newClient,
        status: "contacto_inicial_pendiente",
        Interacciones: [],
        fechaRegistro: new Date().toISOString(),
      });
      // Ordenar las tareas por fecha de registro (más reciente primero)
      this.tasks.sort(
        (a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
      );
      this.showAddModal = false;
    },

    async onClientSaved() {
      this.showAddModal = false;
      await this.cargarTodosLosClientes(); // refresca todo desde la API
      // Ordenar las tareas por fecha de registro (más reciente primero)
      this.tasks.sort(
        (a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
      );
    },

    // Obtiene un token almacenado (intenta varias claves comunes)
    getStoredToken() {
      const keys = ["jwt-token", "jwtToken", "token", "access_token"];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) return { key: k, value: v };
      }
      return null;
    },
    // Decodifica base64url de forma segura
    decodeBase64Url(input) {
      let output = input.replace(/-/g, "+").replace(/_/g, "/");
      const pad = output.length % 4;
      if (pad) output += "=".repeat(4 - pad);
      return atob(output);
    },
    // Parsea un JWT sin verificar firma, solo para leer 'exp'
    parseJwt(token) {
      const parts = token.split(".");
      if (parts.length < 2) throw new Error("Token inválido");
      const payload = JSON.parse(this.decodeBase64Url(parts[1]));
      return payload;
    },
    // Valida token por existencia y expiración (claim 'exp' en segundos)
    hasValidToken() {
      const stored = this.getStoredToken();
      if (!stored) return false;
      try {
        const payload = this.parseJwt(stored.value);
        if (!payload || typeof payload.exp !== "number") return false;
        return payload.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    },
    checkSession() {
      const expired = !this.hasValidToken();
      this.isSessionExpired = expired;
      if (expired) this.startAutoRedirectCountdown();
      else this.stopAutoRedirectCountdown();
    },
    onStorage(e) {
      if (["jwt-token", "jwtToken", "token", "access_token"].includes(e.key)) {
        this.checkSession();
      }
    },
    startAutoRedirectCountdown() {
      this.stopAutoRedirectCountdown();
      this.redirectCountdown = 5;
      this.autoRedirectTimer = setInterval(() => {
        this.redirectCountdown -= 1;
        if (this.redirectCountdown <= 0) {
          this.stopAutoRedirectCountdown();
          this.redirectToLogin();
        }
      }, 1000);
    },
    stopAutoRedirectCountdown() {
      if (this.autoRedirectTimer) {
        clearInterval(this.autoRedirectTimer);
        this.autoRedirectTimer = null;
      }
    },
    redirectToLogin() {
      ["jwt-token", "jwtToken", "token", "access_token"].forEach((k) =>
        localStorage.removeItem(k)
      );
      if (this.$router && typeof this.$router.push === "function") {
        this.$router.push("/login");
      } else {
        window.location.href = "/login";
      }
    },
  },
  computed: {
    // Matches pendientes paginados
    paginatedPendientes() {
      const start = (this.pagination.currentPage - 1) * this.pagination.perPage;
      const end = start + this.pagination.perPage;
      return this.matchesPendientes.slice(start, end);
    },

    // Total de páginas
    totalPages() {
      return Math.ceil(this.matchesPendientes.length / this.pagination.perPage);
    },

    // Información de visualización (Mostrando X-Y de Z)
    paginationInfo() {
      const start =
        (this.pagination.currentPage - 1) * this.pagination.perPage + 1;
      const end = Math.min(
        this.pagination.currentPage * this.pagination.perPage,
        this.matchesPendientes.length
      );
      return `Mostrando ${start}-${end} de ${this.matchesPendientes.length}`;
    },

    // Números de página a mostrar (máximo 5)
    pageNumbers() {
      const current = this.pagination.currentPage;
      const total = this.totalPages;
      const delta = 2; // Número de páginas a mostrar a cada lado de la actual
      const range = [];
      const rangeWithDots = [];

      // Generar rango de páginas alrededor de la actual
      for (
        let i = Math.max(2, current - delta);
        i <= Math.min(total - 1, current + delta);
        i++
      ) {
        range.push(i);
      }

      // Siempre incluir primera página
      if (current - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      // Agregar páginas del rango
      rangeWithDots.push(...range);

      // Siempre incluir última página
      if (current + delta < total - 1) {
        rangeWithDots.push("...", total);
      } else if (total > 1) {
        rangeWithDots.push(total);
      }

      // Si solo hay una página, mostrar solo esa
      return total <= 1 ? [1] : rangeWithDots;
    },

    searchPlaceholder() {
      switch (this.searchFilter) {
        case "person":
          return "Buscar por nombre o apellido de persona";
        case "agent":
          return "Buscar por nombre o apellido de agente";
        default:
          return "Buscar en todos los campos";
      }
    },
    filteredTasks() {
      let list = this.tasks;

      // Filtrar por agente seleccionado
      if (this.selectedAgent && this.selectedAgent !== "all") {
        const sel = String(this.selectedAgent);
        list = list.filter((t) => String(t.agenteId) === sel);
      }

      // Filtrar por término de búsqueda
      if (this.searchTerm) {
        const raw = this.searchTerm || "";
        const tokens = this.normalizeSearch(raw).split(/\s+/).filter(Boolean);
        if (tokens.length) {
          list = list.filter((task) => {
            let searchFields = [];
            switch (this.searchFilter) {
              case "person":
                searchFields = [task.nombre, task.apellido];
                break;
              case "agent":
                searchFields = [
                  task.agenteNombre || "",
                  task.agenteApellido || "",
                ];
                break;
              default:
                searchFields = [
                  task.nombre,
                  task.apellido,
                  task.telefono,
                  task.email,
                  task.agenteNombre || "",
                  task.agenteApellido || "",
                  task.agenteId || "",
                ];
            }
            const haystack = this.normalizeSearch(searchFields.join(" "));
            return tokens.every((t) => haystack.includes(t));
          });
        }
      }

      // Filtrar por rango de fechas (inclusivo)
      if (this.dateFilter.startDate || this.dateFilter.endDate) {
        let start = this.parseFilterDate(this.dateFilter.startDate, false);
        let end = this.parseFilterDate(this.dateFilter.endDate, true);

        // Si solo hay start -> end = mismo día (fin del día)
        if (start && !end)
          end = this.parseFilterDate(this.dateFilter.startDate, true);
        // Si solo hay end -> start = mismo día (inicio del día)
        if (!start && end)
          start = this.parseFilterDate(this.dateFilter.endDate, false);

        list = list.filter((task) => {
          const rawDate = new Date(task.fechaRegistro);
          // Normalizar a fecha (sin hora) usando zona local
          const taskDateOnly = new Date(
            rawDate.getFullYear(),
            rawDate.getMonth(),
            rawDate.getDate()
          );
          return (
            (!start || taskDateOnly >= start) && (!end || taskDateOnly <= end)
          );
        });
      }

      return list;
    },
    statusOptions() {
      return this.columns
        .map((col) => {
          const key = Object.keys(statusMap).find(
            (k) => statusMap[k] === col.estado
          );
          return key
            ? { key: parseInt(key), title: col.title, estado: col.estado }
            : null;
        })
        .filter(Boolean);
    },
  },
  watch: {
    "currentRecordatorio.estadoInteraccionRaw"(val) {
      if (val != null && this.selectedTask) {
        const mapped = statusMap[val];
        if (mapped) {
          this.selectedTask.status = mapped;
        }
      }
    },

    // Resetear a página 1 cuando cambien los matches pendientes
    matchesPendientes() {
      this.pagination.currentPage = 1;
    },
  },
};
//Uno atras
</script>

<style scoped>
.modal-overlay {
  backdrop-filter: blur(0.5px);
}
</style>
