const swaggerJSDoc = require('swagger-jsdoc');

// Definisi spesifikasi OpenAPI
const swaggerDefinition = {
    "openapi": "3.0.0",
    "info": {
        "title": "Sample API",
        "version": "1.0.0",
        "description": "Contoh dokumentasi API",
        "contact": {
            "name": "Nama Pengembang",
            "email": "pengembang@api.com"
        },
        "license": {
            "name": "MIT License",
            "url": "https://opensource.org/licenses/MIT"
        }
    },
    "servers": [
        {
            "url": "http://localhost:3000",
            "description": "Server pengembangan"
        },
        {
            "url": "https://api.example.com",
            "description": "Server produksi"
        }
    ],
    "paths": {
        "/users": {
            "get": {
                "summary": "Mendapatkan daftar pengguna",
                "responses": {
                    "200": {
                        "description": "OK"
                    }
                }
            },
            "post": {
                "summary": "Membuat pengguna baru",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "username": {
                                        "type": "string"
                                    },
                                    "email": {
                                        "type": "string"
                                    },
                                    "password": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "Created"
                    }
                }
            }
        },
        "/users/{userId}": {
            "get": {
                "summary": "Mendapatkan detail pengguna",
                "parameters": [
                    {
                        "in": "path",
                        "name": "userId",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "ID pengguna"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK"
                    }
                }
            },
            "put": {
                "summary": "Memperbarui detail pengguna",
                "parameters": [
                    {
                        "in": "path",
                        "name": "userId",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "ID pengguna"
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "username": {
                                        "type": "string"
                                    },
                                    "email": {
                                        "type": "string"
                                    },
                                    "password": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "OK"
                    }
                }
            },
            "delete": {
                "summary": "Menghapus pengguna",
                "parameters": [
                    {
                        "in": "path",
                        "name": "userId",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "ID pengguna"
                    }
                ],
                "responses": {
                    "204": {
                        "description": "No Content"
                    }
                }
            }
        }
    }
};

const options = {
    swaggerDefinition,
    // Lokasi file JSDoc yang berisi anotasi JSDoc untuk endpoint API
    apis: ['./routes/*.js', './models/*.js'],
};

// Inisialisasi spesifikasi Swagger
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
