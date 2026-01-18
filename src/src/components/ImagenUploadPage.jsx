import React, { useState, useEffect } from 'react';

// Ajusta esta URL si tu backend corre en otro puerto

function ImageUploadPage() {
    const [items, setItems] = useState([]);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    // --- FUNCIÓN A: Obtener items (URL + Descripción) de la DB ---
    const fetchItems = async () => {
        setLoading(true);
        setStatusMessage('Cargando galería...');
        try {
            const response = await fetch(`/api/items`);
            if (!response.ok) throw new Error('No se pudo cargar la lista de ítems.');
            const data = await response.json();
            setItems(data);
            setStatusMessage('');
        } catch (err) {
            setStatusMessage(`Error al cargar: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Cargar la galería al iniciar
    useEffect(() => {
        fetchItems();
    }, []);

    // --- FUNCIÓN B: Subir (Archivo + Descripción) a la API POST ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !description.trim()) {
            setStatusMessage('Debes seleccionar una imagen y añadir una descripción.');
            return;
        }

        setLoading(true);
        setStatusMessage('Subiendo imagen y guardando en la DB...');
        
        const formData = new FormData();
        // Clave importante: 'imagen' y 'description' coinciden con req.file y req.body en el backend
        formData.append('imagen', file);
        formData.append('description', description); 

        try {
            const response = await fetch(`/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error desconocido al subir.');
            }

            // Éxito: Limpiar formulario y recargar galería
            setDescription('');
            setFile(null);
            document.getElementById('file-input').value = null; 
            
            await fetchItems(); // <--- Recarga la galería con el nuevo ítem
            setStatusMessage('✅ ¡Subida exitosa! La galería ha sido actualizada.');

        } catch (err) {
            setStatusMessage(`❌ Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            
            {/* Sección de Subida de Items */}
            <div className="border border-gray-300 p-6 mb-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-sky-700">Subir Imagen y Descripción</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción:</label>
                        <input 
                            type="text" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Archivo de Imagen:</label>
                        <input 
                            type="file" 
                            id="file-input"
                            accept="image/*" 
                            onChange={(e) => setFile(e.target.files[0])} 
                            required
                            className="mt-1 block w-full"
                            disabled={loading}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-2 px-4 border border-transparent rounded-md text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Procesando...' : 'Subir Imagen y Guardar Descripción'}
                    </button>
                </form>
                {statusMessage && <p className={`mt-4 p-2 rounded ${statusMessage.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{statusMessage}</p>}
            </div>

            <hr className="my-8" />

            {/* Sección de Galería (Obtenida de la DB) */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-sky-700">Galería de Imágenes (DB)</h2>
                {loading && items.length === 0 ? (
                    <p>Cargando ítems...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <div key={item.public_id || item.url} className="border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                                    <img 
                                        src={item.url} 
                                        alt={item.description} 
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <p className="font-semibold text-lg mb-1">{item.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-3 text-center text-gray-500">Aún no hay imágenes guardadas en la base de datos.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageUploadPage;