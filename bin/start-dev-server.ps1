echo "Starting development server..."
push-location ..
try{
    npm run dev
}finally{
    pop-location
}