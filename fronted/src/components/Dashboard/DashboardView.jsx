import React from "react";
import {
  Home,
  Users,
  Archive,
  Bell,
  Settings,
  LayoutDashboard,
  Plus,
  Download,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Clock,
  User,
  ChevronRight,
  FileText,
  Menu, // Importado el ícono de menú [cite: 131]
} from "lucide-react";
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
const FAMILY_GROWTH_DATA = [
  { name: "Ene", members: 10, families: 8 },
  { name: "Feb", members: 12, families: 10 },
  { name: "Mar", members: 13, families: 11 },
  { name: "Abr", members: 14, families: 12 },
  { name: "May", members: 13, families: 11 },
  { name: "Jun", members: 14, families: 12 },
];
const WEEKLY_ACTIVITY_DATA = [
  { name: "Sem 1", level: 12 },
  { name: "Sem 2", level: 19 },
  { name: "Sem 3", level: 16 },
  { name: "Sem 4", level: 23 },
];
const ROLE_DISTRIBUTION_DATA = [
  { name: "Jefes de Familia", value: 33 },
  { name: "Niños", value: 17 },
  { name: "Adultos", value: 33 },
  { name: "Adolescentes", value: 17 },
];
// Se añade la prop 'toggleSidebar'
const DashboardView = ({ toggleSidebar }) => (
  <div className="min-h-screen bg-gray-100 font-sans">
    <div className="space-y-6 p-0 md:p-0 max-w-7xl mx-auto">

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 border-b pb-2 flex items-center justify-between">
        <span className="flex items-center truncate">
          {/* Botón de Menú para Responsive: Visible solo en móviles [cite: 138] */}
          <button 
            onClick={toggleSidebar} 
            className="md:hidden text-gray-600 hover:text-blue-600 mr-2 p-1 rounded-md transition duration-150"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 mr-2 text-blue-600 flex-shrink-0" />
          Dashboard: Villa Productiva
        </span>
        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 md:inline-block 
hidden" />
      </h1>
      <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
        Resumen y análisis de la comunidad y núcleos familiares
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetriCard
          title="Jefes de Familia"
          value={METRICS_DATA.jefes}
          icon={Users}
         
 color="blue"
          details={
            <span className="text-green-600 font-semibold text-sm">
              {METRICS_DATA.jefes} Familias registradas
            </span>
          }
        />
        <MetriCard
          title="Total Miembros"
         
 value={METRICS_DATA.totalMembers}
          icon={Users}
          color="indigo"
          details={
            <span className="text-gray-500 text-sm">
              Promedio: {METRICS_DATA.avgMembers} miembros/familia
            </span>
          }
        />
        <MetriCard
 
          title="Miembros Activos"
          value={METRICS_DATA.activeMembers}
          icon={Users}
          color="green"
          details={
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
  
                style={{
                  width: `${
                    (METRICS_DATA.activeMembers / METRICS_DATA.totalMembers) *
                    100
                  }%`,
      
           }}
              ></div>
            </div>
          }
        />
        <MetriCard
          title="Registros Archivados"
          value={METRICS_DATA.archivedRecords}
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
            Crecimiento Familiar
          </h2>
          <p className="text-xs 
 sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Familias y miembros por mes
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
                  `${value} ${name === "members" ?
 "Miembros" : "Familias"}`,
                  name === "members" ?
 "Miembros" : "Familias",
                ]}
              />
              <Bar
                dataKey="families"
                fill="#10B981"
                name="Familias"
      
           radius={[4, 4, 0, 0]}
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
            
      data={ROLE_DISTRIBUTION_DATA}
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

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Actividad Semanal
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
 
            Nivel de participación comunitaria
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={WEEKLY_ACTIVITY_DATA}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
   
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: "10px" }}
              />
      
             <YAxis
                stroke="#6b7280"
                domain={[0, 24]}
                ticks={[0, 6, 12, 18, 24]}
                style={{ fontSize: "10px" }}
              />
      
             <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          
         fontSize: "12px",
                }}
                formatter={(value) => [`Nivel ${value}`, "Participación"]}
              />
              <Line
                type="monotone"
           
           dataKey="level"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ stroke: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
              />
       
           </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-xl transition duration-300">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Resumen de Estado
            </h2>
 
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Estado actual de los registros
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-gray-700 text-sm sm:text-base">
                <span className="font-medium flex items-center">
 
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />{" "}
                  Jefes de Familia Activos
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
             
           {METRICS_DATA.jefes}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-700 text-sm sm:text-base">
                <span className="font-medium flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />{" "}
 
                  Miembros Activos
                </span>
                <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                  {METRICS_DATA.activeMembers}
                </span>
      
          </div>
              <div className="flex justify-between items-center text-gray-700 text-sm sm:text-base">
                <span className="font-medium flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2 text-yellow-500 flex-shrink-0" />{" "}
                  Inactivos
          
           </span>
                <span className="text-gray-500 font-bold bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex-shrink-0">
                  1
                </span>
              </div>
              <div className="flex justify-between items-center text-red-600 text-sm 
 sm:text-base">
                <span className="font-medium flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />{" "}
                  Archivados
                </span>
                <span className="text-red-600 font-bold bg-red-100 px-2 sm:px-3 
 py-1 rounded-full text-xs sm:text-sm flex-shrink-0">
                  {METRICS_DATA.archivedRecords}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
export default DashboardView;