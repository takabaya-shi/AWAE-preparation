var config = {};

// Those values will be different on the production server.
// But you can test with the locally

// Base64: ALLES{this_would_be_your_flag}
config.secret_password = "QUxMRVN7dGhpc193b3VsZF9iZV95b3VyX2ZsYWd9"

// Debug session_keys
config.session_keys = [ "ALLES{session_key_somerandomvalues1234ABCDEF!@#$!!}", 
                        "ALLES{session_key_32randomcharacters123456789abcde}",
                        "ALLES{session_key_this_is_random_on_production_asd}"]

module.exports = config;