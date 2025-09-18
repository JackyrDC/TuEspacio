#!/usr/bin/env node

/**
 * Script para actualizar SafeAreaView deprecated por react-native-safe-area-context
 * Actualiza automáticamente todos los archivos que usan SafeAreaView de React Native
 */

const fs = require('fs');
const path = require('path');

// Lista de archivos a actualizar (basado en la búsqueda anterior)
const filesToUpdate = [
  'src/screens/MapScreen.tsx',
  'src/screens/OwnerDashboardScreen.tsx',
  'src/screens/AddPropertyScreen.tsx',
  'src/screens/PropertyManagementScreen.tsx',
  'src/screens/ApplicationsManagementScreen.tsx',
  'src/screens/MapScreen_ReactNativeMaps.tsx',
  'src/screens/UserProfileScreen.tsx',
  'src/screens/LoginScreen.tsx',
  'src/screens/CompleteProfileScreen.tsx'
];

function updateSafeAreaViewImport(filePath) {
  console.log(`Actualizando: ${filePath}`);
  
  try {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Reemplazar import de SafeAreaView
    const importRegex = /import\s*{([^}]*SafeAreaView[^}]*)\}\s*from\s*'react-native';/;
    const match = content.match(importRegex);
    
    if (match) {
      const importList = match[1];
      // Remover SafeAreaView de la lista de imports de react-native
      const updatedImportList = importList.replace(/,?\s*SafeAreaView\s*,?/, '').replace(/,\s*,/, ',').trim();
      
      // Actualizar el import de react-native
      const newReactNativeImport = `import { ${updatedImportList} } from 'react-native';`;
      
      // Agregar import de SafeAreaView de react-native-safe-area-context
      const safeAreaImport = "import { SafeAreaView } from 'react-native-safe-area-context';";
      
      content = content.replace(importRegex, `${newReactNativeImport}\n${safeAreaImport}`);
      
      // Escribir el archivo actualizado
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
    } else {
      console.log(`⚠️ No se encontró SafeAreaView en: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message);
  }
}

// Ejecutar actualización
console.log('🚀 Iniciando actualización de SafeAreaView...\n');

filesToUpdate.forEach(updateSafeAreaViewImport);

console.log('\n✅ Proceso completado!');
console.log('\nRecuerda verificar manualmente que:');
console.log('1. Los imports estén correctos');
console.log('2. No hay imports duplicados');
console.log('3. El SafeAreaProvider está configurado en App.tsx');