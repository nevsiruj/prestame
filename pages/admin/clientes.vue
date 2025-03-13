<template>
  <div class="grid grid-cols-2 grid-rows-1 gap-4 mb-8">
    <div>
      <form class="flex items-center max-w-lg mx-auto">
        <label for="voice-search" class="sr-only">Buscar</label>
        <div class="relative w-full">
          <input
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-3 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Buscar"
            required
          />
        </div>
        <button
          type="submit"
          class="inline-flex items-center py-2 px-3 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <svg
            class="w-4 h-4 me-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            /></svg
          >Buscar
        </button>
      </form>
    </div>
    <div class="flex justify-end items-end">
      <button
        type="button"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Agregar cliente
      </button>
    </div>
  </div>

  <!-- Tabla -->

  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
    >
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          <th scope="col" class="px-6 py-3">Fecha registro</th>
          <th scope="col" class="px-6 py-3">Nombre y apellido</th>
          <th scope="col" class="px-6 py-3">DNI</th>
          <th scope="col" class="px-6 py-3">Telefono</th>
          <th scope="col" class="px-6 py-3">Direccion</th>
          <th scope="col" class="px-6 py-3">Observacion</th>
          <th scope="col" class="px-6 py-3">Accion</th>
        </tr>
      </thead>
      <tbody>
        <tr
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
        >
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            12/03/2025
          </th>
          <td class="px-6 py-4">Ivan Mendoza</td>
          <td class="px-6 py-4">V18329422</td>
          <td class="px-6 py-4">584127132625</td>
          <td class="px-6 py-4">
            Av. Principal Montalban, Apto. 35 Piso 3, Residencias Amapola
          </td>
          <td class="px-6 py-4">Paga al dia</td>
          <td class="px-6 py-4">
            <a href="#" class="flex font-medium text-gray-600 hover:underline">
              <svg class="w-5 h-5 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                />
              </svg>
              Edit</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});
</script>
