// Importing Dependencies
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const app = require('express')();

const port = process.env.PORT || 3000;

// Create vault url from app settings
const vaultUri = `https://${process.env.VaultName}.vault.azure.net/`;

// Map of Keyvaults secret names values
let vaultSecretsMap = {};



const getKeyVaultSecrets = async () => {
  //Create a KeyVault secret client
  let secretClient = new SecretClient(vaultUri, new DefaultAzureCredential());
  try {
    //Iterate throug each secret in the vault
    listPropertiesOfSecrets = client.listPropertiesOfSecrets()
    while(true) {
      let {done, value} = await listPropertiesOfSecrets.next();
      if (done) {
        break
      }
      //Only load enabled secrets - getSecrets will return an error for disabled secrets
      if (value.enabled) {
        const secret = await client.getSecret(value.name)
        vaultSecretsMap[value.name] = secret.value;
      }
    }
  } catch (error) {
      console.log(error.message)
  }
}

app.get('/api/SecretTest', (req, res) => {
  let secretName = 'SecretPassword';
  let response;
  if (secretName in vaultSecretsMap) {
    response = `Secret value: ${vaultSecretsMap[secretName]}\n\nThis is for testing only, never output the secret to a response or anywhere else`
  } else {
    response = `Error: No secret named ${secretName} was found...`
  }
  res.type('text')
  res.send(response)
})


(async () => {
  await getKeyVaultSecrets();
  app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });
})().catch(err => console.log(err));