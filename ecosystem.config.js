module.exports = {
    apps: [{
        name: 'BACKEND-PUYANGO:3085',
        script: 'index.js',
        
        // Escalabilidad y Balanceo de Carga
        instances: 'max', 
        exec_mode: 'cluster', 

        // Gestión Avanzada de Reinicios
        watch: true, 
        ignore_watch: ['node_modules', 'logs', 'err.log', 'out.log'], 
        autorestart: true, 
        restart_delay: 5000, 
        max_restarts: 10, 
        exp_backoff_restart_delay: 100, 

        // Manejo de Logs
        log_date_format: "YYYY-MM-DD HH:mm:ss",
        combine_logs: true, 
        error_file: 'err.log', 
        out_file: 'out.log', 
        merge_logs: true 
    }]
};