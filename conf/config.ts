import * as path from "path"
import { secrets } from "./secrets"


export const config = {
    "server-port": 3000,
    "db": {
        "url": secrets.url,
        "name": "associated-consulting", 
        "collections": {
            "profiles": "profiles",
            "sequences": "sequences",
            "admins": "admins",
            "sessions": "sessions"
        }
    }, 
    "upload_dir": path.resolve(__dirname, "..", "uploads")
}
