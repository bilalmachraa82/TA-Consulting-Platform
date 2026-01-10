#!/usr/bin/env python3
"""
Docling PDF/DOCX → Markdown Converter

Processa ficheiros de candidaturas de alta prioridade usando IBM Docling
para obter parsing superior de tabelas e estrutura.

Uso:
  pip install docling
  python scripts/docling-processor.py

Output:
  __tests__/candidaturas_markdown/ - Ficheiros Markdown processados
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Verificar se docling está instalado
try:
    from docling.document_converter import DocumentConverter
    from docling.datamodel.base_models import InputFormat
except ImportError:
    print("❌ Docling não instalado. Execute:")
    print("   pip install docling")
    sys.exit(1)

# Configuração
INPUT_DIR = Path("__tests__/candidaturas_processadas")
OUTPUT_DIR = Path("__tests__/candidaturas_markdown")
MANIFEST_FILE = OUTPUT_DIR / "manifest.json"

# Extensões suportadas
SUPPORTED_EXTENSIONS = {'.pdf', '.docx', '.pptx', '.xlsx'}


from typing import Optional

def process_file(input_path: Path, output_dir: Path, converter: DocumentConverter) -> Optional[dict]:
    """Processa um ficheiro e retorna metadata."""
    try:
        # Converter documento
        result = converter.convert(str(input_path))
        
        # Exportar para Markdown
        markdown_content = result.document.export_to_markdown()
        
        # Criar estrutura de output
        relative_path = input_path.relative_to(INPUT_DIR)
        output_path = output_dir / relative_path.with_suffix('.md')
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Escrever ficheiro
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        # Contar tabelas detectadas
        tables_count = markdown_content.count('|---')
        
        return {
            'input': str(input_path),
            'output': str(output_path),
            'size_bytes': os.path.getsize(output_path),
            'tables_detected': tables_count,
            'success': True
        }
        
    except Exception as e:
        return {
            'input': str(input_path),
            'error': str(e),
            'success': False
        }


def main():
    print("🔧 Docling PDF/DOCX → Markdown Processor")
    print("=" * 60)
    
    # Verificar diretório de input
    if not INPUT_DIR.exists():
        print(f"❌ Diretório não encontrado: {INPUT_DIR}")
        print("   Execute primeiro: npx tsx scripts/extract-high-value.ts")
        sys.exit(1)
    
    # Criar diretório de output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Encontrar ficheiros
    files_to_process = []
    for ext in SUPPORTED_EXTENSIONS:
        files_to_process.extend(INPUT_DIR.rglob(f"*{ext}"))
    
    print(f"\n📁 Ficheiros encontrados: {len(files_to_process)}")
    
    if not files_to_process:
        print("   Nenhum ficheiro para processar.")
        return
    
    # Inicializar converter
    print("\n⏳ A inicializar Docling (pode demorar na primeira vez)...")
    converter = DocumentConverter()
    
    # Processar ficheiros
    print("\n📄 A processar ficheiros...")
    results = []
    success_count = 0
    
    for i, file_path in enumerate(files_to_process, 1):
        print(f"   [{i}/{len(files_to_process)}] {file_path.name[:50]}...", end=" ")
        
        result = process_file(file_path, OUTPUT_DIR, converter)
        results.append(result)
        
        if result and result.get('success'):
            success_count += 1
            tables = result.get('tables_detected', 0)
            print(f"✅ ({tables} tabelas)")
        else:
            error = result.get('error', 'Unknown error') if result else 'No result'
            print(f"❌ {error[:50]}")
    
    # Guardar manifest
    manifest = {
        'processed_at': datetime.now().isoformat(),
        'total_files': len(files_to_process),
        'success_count': success_count,
        'failed_count': len(files_to_process) - success_count,
        'files': results
    }
    
    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    # Sumário
    print("\n" + "=" * 60)
    print("✅ PROCESSAMENTO CONCLUÍDO")
    print("=" * 60)
    print(f"\n   Total: {len(files_to_process)}")
    print(f"   Sucesso: {success_count}")
    print(f"   Falhas: {len(files_to_process) - success_count}")
    print(f"\n   Output: {OUTPUT_DIR}")
    print(f"   Manifest: {MANIFEST_FILE}")
    
    # Total de tabelas
    total_tables = sum(r.get('tables_detected', 0) for r in results if r.get('success'))
    print(f"\n   📊 Tabelas detectadas: {total_tables}")


if __name__ == "__main__":
    main()
