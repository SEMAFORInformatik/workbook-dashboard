<template lang="pug">
div
  b-button(@click="enable") Enable 2-Factor auth
  b-modal(v-model="modalOpen" has-modal-card trap-focus width="400")
    template(#default="props")
      div.totp-modal.card
        h3.title.is-3 Please Scan the QR Code with your authenticator app
        h4.subtitle.is-4 and then enter the 6 digit code below
        img(:src="qrCode").qr-code
        h6.subtitle.is-6 Can't scan the QR code? Copy the secret into your authenticator app:
        p.is-size-7 {{ secret }}
        b-field(:type="validationFailed ? 'is-danger' : ''"  label="2FA Code" label-position="on-border")
          b-input(v-model="totp" size="is-medium" icon="lock")
          p.control
            b-button(type="is-primary" size="is-medium" @click="submitTOTP") Submit
</template>
<script lang="ts">
import instance from '../../axios-instance';
import defaultConfig from '../../env-config';

export default {
  data() {
    return {
      modalOpen: false,
      validationFailed: false,
      qrCode: "",
      secret: "",
      totp: ""
    }
  },
  methods: {
    async enable() {
      const response = await instance.put(`${defaultConfig.apiPath}/users/${this.$store.getters["Account/getUsername"]}/initializeTOTP`)
      const [secret, ...image] = response.data.split(";")
      this.secret = secret;
      this.qrCode = image.join(";");
      this.modalOpen = true
    },
    async submitTOTP() {
      // Strip all whitespace
      const code = this.totp.replace(/\s/g, "");
      try {
        await instance.put(`${defaultConfig.apiPath}/users/${this.$store.getters["Account/getUsername"]}/activateTOTP`, { code })
        this.modalOpen = false;
        this.validationFailed = false;
      } catch (_) {
        this.validationFailed = true;

      }

    }
  }
}
</script>

<style lang="scss">
.totp-modal {
  display: flex;
  flex-direction: column;
  padding: 1em;
  border-radius: 12px;

  >h3,
  >h4,
  >h6,
  >p {
    align-self: center;
    max-width: 400px;
    text-align: center;
  }

  >h6 {
    margin-bottom: 0.5rem !important;
  }

  >p {
    margin-bottom: 1rem;
  }
}

.qr-code {
  max-width: 350px;
  align-self: center;
}
</style>
