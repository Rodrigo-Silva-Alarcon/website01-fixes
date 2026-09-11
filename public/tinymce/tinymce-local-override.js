// Override para TinyMCE v7 - Solo Local (Sin Cloud)
// Este script deshabilita completamente el cloud y fuerza el uso local

(function() {
  // Sobrescribir la función tcsl que causa el error
  if (typeof window !== 'undefined') {
    window.tcsl = function() {
      // Función vacía para evitar errores de cloud
      console.log('TinyMCE v7 configurado para uso local únicamente');
    };
    
    // Sobrescribir configuraciones de cloud
    if (typeof tinymce !== 'undefined') {
      // Deshabilitar cloud completamente
      tinymce.overrideDefaults({
        cloud_channel: '',
        api_key: '',
        tinymce_cloud: false,
        validate_api_key: false,
        license_key: 'gpl'
      });
      
      // Sobrescribir la función de inicialización para evitar cloud
      var originalInit = tinymce.init;
      tinymce.init = function(settings) {
        if (settings) {
          // Forzar configuración local
          settings.cloud_channel = '';
          settings.api_key = '';
          settings.tinymce_cloud = false;
          settings.validate_api_key = false;
          settings.license_key = 'gpl';
          settings.branding = false;
          settings.promotion = false;
        }
        return originalInit.call(this, settings);
      };
    }
  }
})();
