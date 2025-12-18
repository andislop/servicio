import React, { useState} from 'react';

// Ajusta esta URL si tu backend corre en otro puerto
const API_URL = 'http://localhost:3001'; 

function ImageUploadPage() {

    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    // Cargar la galería al iniciar
 
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
        formData.append('title', title);

        try {
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error desconocido al subir.');
            }

            // Éxito: Limpiar formulario y recargar galería
            setDescription('');
            setTitle('');
            setFile(null);
            document.getElementById('file-input').value = null; 
            

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
                        <label className="block text-sm font-medium text-gray-700">Título:</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            disabled={loading}
                        />
                    </div>
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


        </div>
    );
}

export default ImageUploadPage;