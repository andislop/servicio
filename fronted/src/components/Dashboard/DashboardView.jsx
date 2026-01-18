import React, {useMemo}from "react";
import { Users, Archive, User } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  PieChart,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  Pie,
  Cell,
} from "recharts";
import MetriCard from "./Metrica1";

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
const METRICS_DATA = {
  jefes: 2,
  totalMembers: 6,
  avgMembers: 3,
  activeMembers: 5,
  archivedRecords: 1,
};

// Se añade la prop 'toggleSidebar'
const DashboardView = ({
  familyHeads,
  nucleo,
  datoPersonas,
  datosGrafica,
  datosGrafica2,
  datosPersonasInactivas
}) => {
  //Para saber cuantos jefes hay en el sistemea
  const jefeFamilia = familyHeads.filter((f) => f.total).length;
  //Para saber cuantas familias existen
  const totalFamilia = nucleo.filter((f) =>
    f.members.some((m) => m.isHead)
  ).length;

const FAMILY_GROWTH_DATA = useMemo(() => {
  return datosGrafica.map((item) => ({
    name: item.torre, 
    members: item.total, 
    families: item.cantidad_familias || 0, 
  }));
}, [datosGrafica]); // Solo se recalcula si datosGrafica cambia

  const ROLE_DISTRIBUTION_DATA = React.useMemo(() => {
    return datosGrafica2.map((item) => ({
      name: item.rango || "Sin nombre",
      value: parseFloat(item.porcentaje) || 0,
    }));
  }, [datosGrafica2]);

  const personasInactivas = datosPersonasInactivas?.[0]?.total || 0;
  const totalPersonas = datoPersonas?.[0]?.total|| 0;
  const promedioPersonas = datoPersonas?.[0]?.promedio || 0;

  return (
    <div className="min-h-screen font-sans">
      <div className="space-y-6 p-0 md:p-0 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 border-b pb-2 flex items-center justify-between">
          <span className="flex items-center truncate">
            <User className="w-6 h-6 sm:w-8 sm:h-8 mr-2 text-blue-600 flex-shrink-0" />
            Dashboard: Villa Productiva
          </span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
          Resumen y análisis de la comunidad y núcleos familiares
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetriCard
            title="Jefes de Familia"
            value={jefeFamilia}
            icon={Users}
            color="blue"
            details={
              <span className="text-green-600 font-semibold text-sm">
                {totalFamilia} Familias registradas
              </span>
            }
          />
          <MetriCard
            title="Total Miembros"
            value={totalPersonas}
            icon={Users}
            color="indigo"
            details={
              <span className="text-gray-500 text-sm">
                Promedio: {promedioPersonas} miembros/familia
              </span>
            }
          />

          <MetriCard
            title="Registros Archivados"
            value={personasInactivas}
            icon={Archive}
            color="red"
            details={
              <a
                href="#"
                className="text-red-600 hover:text-red-700 font-medium transition duration-150 text-sm"
              >
                Ver archivos
              </a>
            }
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Gráfica total villa productiva
            </h2>
            <p
              className="text-xs 
 sm:text-sm text-gray-500 mb-4 sm:mb-6"
            >
              Torres y miembros
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={FAMILY_GROWTH_DATA}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                />

                <YAxis stroke="#6b7280" style={{ fontSize: "10px" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",

                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value, name) => [
                    `${value} ${name === "members" ? "Miembros" : "Familias"}`,
                    name === "members" ? "Miembros" : "Familias",
                  ]}
                />
                <Bar
                  dataKey="members"
                  fill="#3B82F6"
                  name="Miembros"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Distribución por Roles
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Composición familiar de la comunidad
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ROLE_DISTRIBUTION_DATA.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${Math.round(percent * 100)}%`
                  }
                  style={{ fontSize: "12px" }}
                >
                  {ROLE_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",

                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardView;
