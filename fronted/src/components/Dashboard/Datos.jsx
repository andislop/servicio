import React, { useState, useMemo, useEffect } from "react";
import { Archive, Plus, Download, Edit, Eye, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge";
import XLSX from "xlsx-js-style";
import Axios from "axios";
import ActionButton from "./ActionButton";

const Usuarios = ({ poblacion }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1); // Nuevo estado para la página actual

  const ITEMS_PER_PAGE = 5; // Limite de 5 usuarios por página

  const filteredPeople = useMemo(() => {
    return poblacion.filter((p) => {
      const fullSearchText =
        `${p.primer_nombre} ${p.primer_apellido} ${p.cedula} ${p.vivienda} ${p.segundo_nombre}${p.segundo_apellido}`.toLowerCase();
      const matchesSearch = fullSearchText.includes(searchTerm.toLowerCase());
      const matchesCat =
        filterStatus === "Todos" || p.categoria === filterStatus;
      return matchesSearch && matchesCat;
    });
  }, [poblacion, searchTerm, filterStatus]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredPeople.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  // Obtener solo los usuarios de la página actual
  const currentHeads = filteredPeople.slice(indexOfFirstItem, indexOfLastItem);

  // 💡 Truco: Resetear la página a 1 cuando los filtros cambian.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Función para cambiar de página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Renderizado de botones numéricos de paginación
  const renderPaginationButtons = () => {
    const pages = [];
    // Muestra hasta 5 botones numéricos centrados en la página actual
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm rounded-lg transition-colors font-medium ${
            i === currentPage
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          aria-current={i === currentPage ? "page" : undefined}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  const firstItemDisplayed =
    filteredPeople.length > 0 ? indexOfFirstItem + 1 : 0;
  const lastItemDisplayed = Math.min(indexOfLastItem, filteredPeople.length);

  const stats = useMemo(() => {
    return {
      ninos: poblacion.filter((u) => u.categoria === "Niño/a").length,
      adolescentes: poblacion.filter((u) => u.categoria === "Adolescente")
        .length,
      adultos: poblacion.filter((u) => u.categoria === "Adulto").length,
      mayores: poblacion.filter((u) => u.categoria === "Adulto Mayor").length,
    };
  }, [poblacion]); // Se recalcula solo cuando cambian los datos de la API

  const descargarExcel = async () => {
    try {
      const res = await Axios.get("http://localhost:3001/api/personas");
      const personas = res.data;

      const encabezados = [
        "N° DE MANZANA",
        "GRUPO FAMILIAR",
        "NACIONALIDAD",
        "CEDULA",
        "NOMBRES Y APELLIDOS",
        "EDAD",
        "SEXO",
        "FECHA NACIMIENTO",
        "TELEFONO",
        "TIPO PERSONA",
        "ES MANZANERO",
        "CARNET CODIGO",
        "CARNET SERIAL",
        "OBSERVACION SOCIAL",
      ];
      const filas = personas.map((p) => {
        // Limpiamos los nombres para que no salga "undefined"
        const nombreLimpio = [
          p.primer_nombre,
          p.segundo_nombre,
          p.primer_apellido,
          p.segundo_apellido,
        ]
          .filter(Boolean) // Quita null, undefined o strings vacíos
          .join(" ")
          .toUpperCase();

        return [
          p.vivienda_extra,
          p.nombre_familia_extra,
          (p.nacionalidad || "V").toUpperCase(),
          p.cedula,
          nombreLimpio, // <--- Nombre ya procesado
          p.edad,
          (p.sexo || "").toUpperCase(),
          p.fecha_nacimiento,
          p.telefono,
          (p.rol || "MIEMBRO").toUpperCase(),
          p.es_manzanero ? "SI" : "NO",
          p.codigo_carnet || "",
          p.serial_carnet || "",
          p.notes || " ",
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);

      // 1. AJUSTE DE ANCHO DE COLUMNAS (Para que no se vea pegado)
      ws["!cols"] = [
        { wch: 15 }, // Manzana
        { wch: 25 }, // Grupo Familiar
        { wch: 15 }, // Nacionalidad
        { wch: 15 }, // Cedula
        { wch: 50 }, // Nombre (Más ancho)
        { wch: 8 }, // Edad
        { wch: 12 }, // Sexo
        { wch: 18 }, // Fecha
        { wch: 15 }, // Telefono
        { wch: 15 }, // Tipo Persona
        { wch: 15 }, // Manzanero
        { wch: 15 }, // Codigo
        { wch: 15 }, // Serial
        { wch: 30 }, // Observacions
      ];

      // 2. ESTILOS DE BORDE, CENTRADO Y COLOR
      const estiloCuerpo = {
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      const estiloHeader = {
        ...estiloCuerpo,
        fill: { fgColor: { rgb: "FF9900" } }, // Color Naranja
        font: { bold: true, color: { rgb: "000000" } },
      };

      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[addr]) continue;
          ws[addr].s = R === 0 ? estiloHeader : estiloCuerpo;
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "CENSO");
      XLSX.writeFile(wb, "Censo_Villa_Productiva_Descendente.xlsx");
    } catch (error) {
      console.error("Error al descargar:", error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* SECCIÓN DE ENCABEZADO Y ACCIONES */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Gestión de Datos
            </h1>
          </div>
          <p className="text-gray-500 text-sm sm:text-lg mt-1">
            Administra los datos del sistema
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <button
            onClick={descargarExcel}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm w-full sm:w-auto"
          >
            <Download className="h-5 w-5" />
            <span>Descargar Datos</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {/* Fila Superior: Búsqueda y Botones Principales */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar por nombre, email o vivienda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full lg:flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="flex space-x-3 w-full lg:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Todos">Todos</option>
              <option value="Niño/a">Niño/a</option>
              <option value="Adolescente">Adolescentes</option>
              <option value="Adulto">Adultos</option>
              <option value="Adulto Mayor">Adultos Mayores</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("Todos");
                setCurrentPage(1);
              }}
              className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Fila Inferior: Contadores Estadísticos (Ahora visibles en móvil) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
          <div className="flex flex-col items-center justify-center p-2 bg-pink-50 rounded-lg border border-pink-100">
            <p className="text-[10px] uppercase font-bold text-pink-400">
              Niños
            </p>
            <p className="text-lg font-bold text-pink-700">{stats.ninos}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-[10px] uppercase font-bold text-purple-400">
              Adolescentes
            </p>
            <p className="text-lg font-bold text-purple-700">
              {stats.adolescentes}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-[10px] uppercase font-bold text-blue-400">
              Adultos
            </p>
            <p className="text-lg font-bold text-blue-700">{stats.adultos}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-green-50 rounded-lg border border-green-100">
            <p className="text-[10px] uppercase font-bold text-green-400">
              Adultos Mayores
            </p>
            <p className="text-lg font-bold text-green-700">{stats.mayores}</p>
          </div>
        </div>
      </div>

      <p className="text-gray-500 mt-4 text-sm">
        Mostrando {firstItemDisplayed}-{lastItemDisplayed} de{" "}
        {filteredPeople.length} usuarios
      </p>

      {/* LISTA DE USUARIOS */}
      <div className="space-y-4">
        {currentHeads.map((p) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-shadow hover:shadow-lg"
          >
            <div className="flex items-start space-x-4 mb-3 sm:mb-0 sm:flex-grow min-w-0">
              {/* Avatar con iniciales del primer nombre y apellido */}
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                {p.primer_nombre[0]}
                {p.primer_apellido[0]}
              </div>

              <div className="min-w-0 flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-0.5">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {p.primer_nombre} {p.segundo_nombre} {p.primer_apellido}{" "}
                    {p.segundo_apellido}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.categoria === "Niño/a"
                        ? "bg-pink-100 text-pink-800"
                        : p.categoria === "Adolescente"
                          ? "bg-purple-100 text-purple-800"
                          : p.categoria === "Adulto"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                    }`}
                  >
                    {p.categoria} ({p.edad} años)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs sm:text-sm text-gray-500">
                  <p>
                    <span className="font-medium">C.I:</span> {p.cedula}
                  </p>
                  <p className="truncate">
                    <MapPin className="h-3 w-3 inline-block mr-1 text-red-400" />
                    {p.vivienda}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {currentHeads.length === 0 && filteredPeople.length > 0 && (
          <p className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-md">
            No hay jefes de familia en esta página. Intente ir a la página 1.
          </p>
        )}
        {filteredPeople.length === 0 && (
          <p className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-md">
            No se encontraron usuarios que coincidan con la búsqueda.
          </p>
        )}
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
          {/* Botón Anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg transition-colors font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {/* Botones de página */}
          <div className="flex space-x-2">{renderPaginationButtons()}</div>

          {/* Botón Siguiente */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg transition-colors font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
