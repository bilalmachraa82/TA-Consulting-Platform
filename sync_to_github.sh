
#!/bin/bash

echo "🚀 Sincronizando TA Consulting Platform com GitHub..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -d ".git" ]; then
    echo "❌ Erro: Não estamos em um repositório Git!"
    exit 1
fi

# Adicionar todos os arquivos
echo "📦 Adicionando arquivos..."
git add .

# Verificar se há mudanças
if git diff --staged --quiet; then
    echo "✅ Nenhuma mudança para commitar!"
else
    # Commit
    echo "💾 Criando commit..."
    read -p "Mensagem do commit (deixe vazio para 'Update: Sync with GitHub'): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update: Sync with GitHub"
    fi
    git commit -m "$commit_msg"
    
    # Push
    echo "☁️ Enviando para GitHub..."
    git push -u origin master
    
    echo ""
    echo "✅ Sincronização concluída!"
fi
