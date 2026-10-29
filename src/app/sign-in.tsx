import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ProviderIcon, type ProviderId } from '@/components/provider-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { ApiError, api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { completeOAuthPopup, OAuthError } from '@/lib/oauth'

completeOAuthPopup()

const providers: [ProviderId, string][] = [
  ['github', 'GitHub'],
  ['google', 'Google'],
  ['facebook', 'Facebook'],
]

type Step = { kind: 'password' } | { kind: 'two-factor'; challenge: string; method: 'totp' | 'recovery'; totp: boolean }

function messageFor(error: unknown) {
  if (error instanceof ApiError || error instanceof OAuthError) return error.message
  return "Couldn't reach the server. Check the address and your connection."
}

export default function SignInScreen() {
  const auth = useAuth()
  const [step, setStep] = useState<Step>({ kind: 'password' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [server, setServer] = useState(auth.serverUrl)
  const [showServer, setShowServer] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The providers this server has set up.
  const enabled = useQuery({
    queryKey: ['providers', auth.serverUrl],
    queryFn: () => api<Record<ProviderId, boolean>>('/api/mobile/auth/providers'),
  })
  const offered = providers.filter(([id]) => enabled.data?.[id])

  // Signing in either way may need a second factor next.
  async function attempt(signIn: () => ReturnType<typeof auth.signIn>) {
    setBusy(true)
    setError(null)
    try {
      if (server !== auth.serverUrl) await auth.setServerUrl(server)
      const challenge = await signIn()
      if (challenge) {
        setStep({
          kind: 'two-factor',
          challenge: challenge.challenge,
          method: challenge.methods.totp ? 'totp' : 'recovery',
          totp: challenge.methods.totp,
        })
      }
    } catch (e) {
      setError(messageFor(e))
    } finally {
      setBusy(false)
    }
  }

  const submitPassword = () => attempt(() => auth.signIn(email.trim(), password))

  async function submitCode() {
    if (step.kind !== 'two-factor') return
    setBusy(true)
    setError(null)
    try {
      await auth.verifySecondFactor(step.challenge, step.method, code.trim())
    } catch (e) {
      // An expired challenge means starting again.
      if (e instanceof ApiError && e.status === 410) setStep({ kind: 'password' })
      setError(messageFor(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Scrolls whichever field is focused into view above the keyboard. */}
      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: 24, padding: 24 }}
        keyboardShouldPersistTaps="handled">
          <View className="gap-2">
            <Text variant="h1" className="text-left">
              Sign in
            </Text>
            <Text variant="muted">
              {step.kind === 'password'
                ? 'Sign in the same way you do on the site.'
                : step.method === 'totp'
                  ? 'Enter the code from your authenticator app.'
                  : 'Enter one of your recovery codes.'}
            </Text>
          </View>

          {step.kind === 'password' ? (
            <View className="gap-4">
              {offered.map(([id, label]) => (
                <Button
                  key={id}
                  variant="outline"
                  disabled={busy}
                  onPress={() => attempt(() => auth.signInWithProvider(id))}>
                  <ProviderIcon provider={id} />
                  <Text>Continue with {label}</Text>
                </Button>
              ))}
              {offered.length > 0 && (
                <View className="flex-row items-center gap-3">
                  <View className="h-px flex-1 bg-border" />
                  <Text variant="muted">or with your email</Text>
                  <View className="h-px flex-1 bg-border" />
                </View>
              )}
              <View className="gap-1.5">
                <Label nativeID="email">Email</Label>
                <Input
                  aria-labelledby="email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="username"
                />
              </View>
              <View className="gap-1.5">
                <Label nativeID="password">Password</Label>
                <Input
                  aria-labelledby="password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="current-password"
                  textContentType="password"
                  onSubmitEditing={submitPassword}
                />
              </View>
              {showServer ? (
                <View className="gap-1.5">
                  <Label nativeID="server">Server</Label>
                  <Input
                    aria-labelledby="server"
                    value={server}
                    onChangeText={setServer}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    // So the providers offered are this server's.
                    onEndEditing={() => void auth.setServerUrl(server)}
                  />
                </View>
              ) : (
                <Pressable onPress={() => setShowServer(true)} hitSlop={8}>
                  <Text variant="muted">Server: {auth.serverUrl} · Change</Text>
                </Pressable>
              )}
              {error && <Text className="text-destructive">{error}</Text>}
              <Button onPress={submitPassword} disabled={busy || !email || !password}>
                <Text>{busy ? 'Signing in…' : 'Sign in'}</Text>
              </Button>
            </View>
          ) : (
            <View className="gap-4">
              <Input
                value={code}
                onChangeText={setCode}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={step.method === 'totp' ? 'number-pad' : 'default'}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                placeholder={step.method === 'totp' ? '123456' : 'Recovery code'}
                onSubmitEditing={submitCode}
              />
              {error && <Text className="text-destructive">{error}</Text>}
              <Button onPress={submitCode} disabled={busy || !code}>
                <Text>{busy ? 'Checking…' : 'Continue'}</Text>
              </Button>
              {step.totp && (
                <Button
                  variant="link"
                  onPress={() => {
                    setCode('')
                    setStep({ ...step, method: step.method === 'totp' ? 'recovery' : 'totp' })
                  }}>
                  <Text>{step.method === 'totp' ? 'Use a recovery code instead' : 'Use your authenticator app'}</Text>
                </Button>
              )}
              <Button variant="ghost" onPress={() => setStep({ kind: 'password' })}>
                <Text>Back</Text>
              </Button>
            </View>
          )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
