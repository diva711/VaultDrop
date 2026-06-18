CREATE TABLE files (
  id            VARCHAR(12) PRIMARY KEY,        
  original_name VARCHAR(255) NOT NULL,          
  s3_key        VARCHAR(512) NOT NULL,          
  size_bytes    BIGINT NOT NULL,                
  mime_type     VARCHAR(128),                   
  expires_at    TIMESTAMP NOT NULL,             
  created_at    TIMESTAMP DEFAULT NOW(),        
  download_count INT DEFAULT 0,                 
  is_deleted    BOOLEAN DEFAULT FALSE           
);

CREATE INDEX idx_expires_at ON files (expires_at);
CREATE INDEX idx_is_deleted ON files (is_deleted);