# taskServ
## Getting Started

To get started with `taskServ`, follow these instructions.

### Prerequisites

Ensure you have the following installed on your system:
- Node.js
- npm
- MySQL

### Installation

1. **Clone the Repository**

   ```sh
   git clone <repository_url>
   cd taskServ
   ```

2. **Setup Environment Variables**

   Create a `.env` file in the `/src` folder with the following structure:

   ```dotenv
   # APP
   TSRV_HOST=[some host]
   TSRV_PORT=[some port]

   # DB
   TSRV_SECRET=[some secret]
   TSRV_DBHOST=[some host]
   TSRV_DBPORT=3306
   TSRV_DB=taskserv
   TSRV_DIALECT=mysql
   TSRV_USER=[some user]
   TSRV_PASS=[some password]
   TSRV_STOR=:memory:
   TSRV_REPO=true
   ```

### Starting the application

Run the initialization script:

```sh
sh init.sh
```

### Insomnia

An `insomnia-taskserv.json` workspace export file is provided.
The file can be imported to make REST requests.