const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const docusign = require("docusign-esign");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5050;

// ✅ CORS FIX: Allow frontend origin + preflight headers
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-vercel-site.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true,
}));


app.use(bodyParser.json());

// 🔐 DocuSign Config (real from your screenshot)
const INTEGRATION_KEY = "3d2ab302-054e-423f-a8f5-a485dae160b6";
const USER_ID = "0ad1e42d-5fd1-4291-ae2f-e95a789189ed";
const ACCOUNT_ID = "ff9e8e98-6f2f-4fb4-a08b-a1ea2e9b35a2";
const BASE_PATH = "https://demo.docusign.net/restapi";
const REDIRECT_URI = "http://localhost:3000";
const PRIVATE_KEY_PATH = path.join(__dirname, "private.key");

app.post("/sign", async (req, res) => {
  const { fullName, email } = req.body;

  try {
    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH);

    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(BASE_PATH);
    apiClient.setOAuthBasePath("account-d.docusign.com");

    const results = await apiClient.requestJWTUserToken(
      INTEGRATION_KEY,
      USER_ID,
      "signature",
      privateKey,
      3600
    );

    const accessToken = results.body.access_token;
    apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    const envelope = {
      emailSubject: "Please sign the Cobber Driver Agreement",
      documents: [
        {
          documentBase64: Buffer.from("Agreement to be signed by the driver. **signature**").toString("base64"),
          name: "Agreement.txt",
          fileExtension: "txt",
          documentId: "1"
        }
      ],
      recipients: {
        signers: [
          {
            email,
            name: fullName,
            recipientId: "1",
            routingOrder: "1",
            clientUserId: "1234",
            tabs: {
              signHereTabs: [
                {
                  anchorString: "**signature**",
                  anchorYOffset: "10",
                  anchorUnits: "pixels",
                  anchorXOffset: "20"
                }
              ]
            }
          }
        ]
      },
      status: "sent"
    };

    const result = await envelopesApi.createEnvelope(ACCOUNT_ID, { envelopeDefinition: envelope });
    const envelopeId = result.envelopeId;

    const viewRequest = {
      authenticationMethod: "none",
      clientUserId: "1234",
      recipientId: "1",
      returnUrl: REDIRECT_URI,
      userName: fullName,
      email
    };

    const recipientView = await envelopesApi.createRecipientView(ACCOUNT_ID, envelopeId, { recipientViewRequest: viewRequest });

    res.json({ url: recipientView.url });

  } catch (error) {
    console.error("DocuSign Error:", error?.response?.body || error.message);
    res.status(500).send("Failed to create signing link");
  }
});

app.listen(PORT, () => {
  console.log(`✅ DocuSign server running at http://localhost:${PORT}`);
});
