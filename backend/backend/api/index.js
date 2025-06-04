const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const docusign = require("docusign-esign");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const INTEGRATION_KEY = "3d2ab302-054e-423f-a8f5-a485dae160b6";
const USER_ID = "0ad1e42d-5fd1-4291-ae2f-e95a789189ed";
const ACCOUNT_ID = "ff9e8e98-6f2f-4fb4-a08b-a1ea2e9b35a2";
const BASE_PATH = "https://demo.docusign.net/restapi";
const REDIRECT_URI = "http://localhost:3000";
const PRIVATE_KEY_PATH = path.join(__dirname, "../private.key");

app.post("/api/sign", async (req, res) => {
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
    apiClient.addDefaultHeader("Authorization", `Bearer ${accessToken}`);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    const envelopeDefinition = {
      emailSubject: "Please sign this document",
      recipients: {
        signers: [
          {
            email,
            name: fullName,
            recipientId: "1",
            routingOrder: "1",
            tabs: {
              signHereTabs: [
                {
                  anchorString: "**signature**",
                  anchorYOffset: "0",
                  anchorUnits: "pixels",
                },
              ],
            },
          },
        ],
      },
      documents: [
        {
          documentBase64: "BASE64_ENCODED_DOCUMENT_CONTENT",
          name: "Sample Document",
          fileExtension: "pdf",
          documentId: "1",
        },
      ],
      status: "sent",
    };

    const results2 = await envelopesApi.createEnvelope(ACCOUNT_ID, {
      envelopeDefinition,
    });

    const envelopeId = results2.envelopeId;

    const viewRequest = {
      returnUrl: REDIRECT_URI,
      authenticationMethod: "none",
      email,
      userName: fullName,
      recipientId: "1",
    };

    const viewUrl = await envelopesApi.createRecipientView(
      ACCOUNT_ID,
      envelopeId,
      { recipientViewRequest: viewRequest }
    );

    res.json({ url: viewUrl.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = app;
