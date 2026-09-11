"use client"

import { Editor } from '@tinymce/tinymce-react'
import { useRef } from 'react'

interface RichTextEditorProps {
  value?: string
  onChange?: (content: string) => void
  placeholder?: string
  height?: number
  disabled?: boolean
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Escribe tu contenido aquí...',
  height = 300,
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorChange = (content: string) => {
    if (onChange) {
      onChange(content)
    }
  }

  return (
    <div className="rich-text-editor">
      <Editor
        disabled={disabled}
        licenseKey="gpl"
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          menubar: true,
          language: 'es',
          base_url: '/tinymce',
          suffix: '.min',
          // Configuración para TinyMCE v7 Community Edition - Solo Local
          branding: false,
          promotion: false,
          // Deshabilitar completamente el cloud
          api_key: '',
          // Solo plugins gratuitos disponibles en v7
          plugins: [
             "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              "emoticons",
              "help",
              "wordcount",
              "autosave"
          ],
          toolbar: "undo redo | formatselect | " +
        "bold italic underline forecolor backcolor | " +
        "alignleft aligncenter alignright alignjustify | " +
        "bullist numlist outdent indent | link image media | " +
        "table emoticons code fullscreen | removeformat | help",
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          //menubar: "file edit view insert format tools table help",
          placeholder: placeholder,
          // Configuraciones básicas
          statusbar: true,
          resize: true,
          elementpath: true,
          verify_html: false,
          cleanup: true,
          contextmenu: 'link image imagetools table',
          // Configuración específica para versión Community
          forced_root_block: 'p',
          force_br_newlines: false,
          force_p_newlines: true,
          convert_newlines_to_brs: false,
          remove_redundant_brs: true,
          // Configuración para evitar errores de API en v7
          validate_api_key: false,
          // Deshabilitar plugins comerciales
          external_plugins: {},
          // Configuración específica para evitar cloud
          tinymce_cloud: false,
          cloud_channel: '',
          // Configuración de inicialización
          setup: function (editor) {
            editor.on('init', function () {
              console.log('TinyMCE v7 Community Edition (Local) inicializado correctamente');
            });
          }
        }}
      />
    </div>
  )
}
