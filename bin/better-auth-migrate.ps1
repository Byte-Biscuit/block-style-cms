echo "Running Better Auth migration..."
push-location ..
try{
    npx @better-auth/cli migrate
}finally{
    pop-location
}