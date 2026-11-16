import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { CUSTOM_ENV_ID, ENVIRONMENTS } from '../../data/environments';
import {
  HIDE_HEADER_VARIANTS,
  INCLUDE_ACTIONS,
  ROUTES,
  SSO_KINDS,
  isJoinRoute,
  routeById,
  type IncludeAction,
} from '../../data/routes';
import { JOIN_HOSTS, JOIN_TEST_KEYWORDS, JOIN_TYPES, joinHostById } from '../../data/join';
import Tooltip from '@mui/material/Tooltip';
import { useLab } from '../../state/store';
import { useBuiltUrl } from '../../lib/useBuiltUrl';
import { CANDIDATES } from '../stage/HostShell';
import { MONO } from '../../theme';
import { Hint, Section } from './ui';

const TIER_COLOR = { prod: '#ef4444', staging: '#f59e0b', dev: '#38bdf8', local: '#22c55e' };

export default function UrlPanel() {
  const p = useLab((s) => s.url);
  const set = useLab((s) => s.setUrl);
  const route = routeById(p.routeId);
  const has = (f: string) => route.fields.includes(f as never);
  const built = useBuiltUrl();
  const join = isJoinRoute(p.routeId);

  return (
    <>
      <Section title="Where">
        <TextField select label="View" value={p.routeId} onChange={(e) => set({ routeId: e.target.value })}>
          {(['Conversations', 'Broadcasts', 'Auth', 'Public pages', 'Other'] as const).flatMap((g) => [
            <ListSubheader key={g}>{g}</ListSubheader>,
            ...ROUTES.filter((r) => r.group === g).map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.label}
              </MenuItem>
            )),
          ])}
        </TextField>
        <Hint>{route.description}</Hint>
        {join ? (
          <>
            <TextField select label="Join page host" value={p.joinHostId} onChange={(e) => set({ joinHostId: e.target.value })}>
              {JOIN_HOSTS.map((h) => (
                <MenuItem key={h.id} value={h.id}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: TIER_COLOR[h.tier] }} />
                    <Box sx={{ flex: 1 }}>{h.label}</Box>
                    <Typography sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary' }}>
                      {h.origin.replace(/^https?:\/\//, '')}/{h.prefix}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <Hint>{joinHostById(p.joinHostId).note}</Hint>
          </>
        ) : (
          <>
            <TextField select label="Environment" value={p.envId} onChange={(e) => set({ envId: e.target.value })}>
              {ENVIRONMENTS.map((env) => (
                <MenuItem key={env.id} value={env.id}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: TIER_COLOR[env.tier] }} />
                    <Box sx={{ flex: 1 }}>{env.label}</Box>
                    <Typography sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary' }}>
                      {env.origin.replace(/^https?:\/\//, '')}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
              <MenuItem value={CUSTOM_ENV_ID}>Custom origin…</MenuItem>
            </TextField>
            {p.envId === CUSTOM_ENV_ID && (
              <TextField
                label="Origin"
                value={p.customOrigin}
                onChange={(e) => set({ customOrigin: e.target.value })}
                slotProps={{ htmlInput: { style: { fontFamily: MONO } } }}
              />
            )}
            {ENVIRONMENTS.find((e) => e.id === p.envId)?.note && (
              <Hint>{ENVIRONMENTS.find((e) => e.id === p.envId)?.note}</Hint>
            )}
          </>
        )}
      </Section>

      {join && (
        <Section title="Join form">
          <Stack sx={{ gap: 0.75 }}>
            <TextField
              label="Account keyword"
              value={p.joinKeyword}
              onChange={(e) => set({ joinKeyword: e.target.value.trim() })}
              helperText="The account’s SMS keyword (often the AccountID). Add .group for a group’s join keyword."
              slotProps={{ htmlInput: { style: { fontFamily: MONO } } }}
            />
            <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
              {JOIN_TEST_KEYWORDS.map((k) => (
                <Tooltip key={k.keyword} title={`Staging: ${k.note}`}>
                  <Box
                    component="button"
                    onClick={() => set({ joinKeyword: k.keyword })}
                    sx={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontFamily: MONO,
                      fontSize: 11,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      border: 1,
                      borderColor: p.joinKeyword === k.keyword ? 'primary.main' : 'divider',
                      color: p.joinKeyword === k.keyword ? 'primary.main' : 'text.secondary',
                      '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                    }}
                  >
                    {k.keyword}
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          </Stack>
          <ToggleButtonGroup
            size="small"
            exclusive
            fullWidth
            value={JOIN_TYPES.some((t) => t.id === p.joinType) ? p.joinType : null}
            onChange={(_, v) => v !== null && set({ joinType: v })}
          >
            {JOIN_TYPES.map((t) => (
              <ToggleButton key={t.id || 'none'} value={t.id}>
                {t.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Hint>
            Only changes the consent sentence: “you agree to receive{' '}
            <b>{(JOIN_TYPES.find((t) => t.id === p.joinType) ?? JOIN_TYPES[0]).wording}</b> from …”. cea-desktop
            always shares the promotional link.
          </Hint>
          <TextField
            label="Type segment (raw)"
            value={p.joinType}
            onChange={(e) => set({ joinType: e.target.value.trim() })}
            helperText="Try something unknown: it should fall back to informational."
            slotProps={{ htmlInput: { style: { fontFamily: MONO } } }}
          />
        </Section>
      )}

      {(has('conversationId') || has('phoneNumber') || has('textNumberId') || has('customPath') || has('sso')) && (
        <Section title="Inputs">
          {has('sso') && (
            <>
              <ToggleButtonGroup
                size="small"
                exclusive
                fullWidth
                value={p.ssoKind}
                onChange={(_, v) => v && set({ ssoKind: v })}
              >
                {SSO_KINDS.map((k) => (
                  <ToggleButton key={k.id} value={k.id} sx={{ fontFamily: MONO, fontSize: 11.5 }}>
                    {k.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Hint>{SSO_KINDS.find((k) => k.id === p.ssoKind)?.description}</Hint>
              <TextField
                label={`${p.ssoKind} value`}
                value={p.ssoValue}
                onChange={(e) => set({ ssoValue: e.target.value })}
                placeholder="Paste from the API response (not saved or shared)"
                type="password"
                autoComplete="off"
                slotProps={{ htmlInput: { style: { fontFamily: MONO } } }}
              />
              <Stack direction="row">
                <FormControlLabel
                  control={<Switch checked={p.ssoHideHeader} onChange={(e) => set({ ssoHideHeader: e.target.checked })} />}
                  label="hideheader=true"
                />
                {p.ssoKind === 'TemporaryKey' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={p.ssoDestinationHome}
                        onChange={(e) => set({ ssoDestinationHome: e.target.checked })}
                      />
                    }
                    label="destination=home"
                  />
                )}
              </Stack>
            </>
          )}
          {has('conversationId') && (
            <TextField
              label="Conversation id"
              value={p.conversationId}
              onChange={(e) => set({ conversationId: e.target.value.trim() })}
              slotProps={{ htmlInput: { style: { fontFamily: MONO } } }}
            />
          )}
          {has('phoneNumber') && (
            <Stack sx={{ gap: 0.75 }}>
              <TextField
                label="Phone number"
                value={p.phoneNumber}
                onChange={(e) => set({ phoneNumber: e.target.value })}
                slotProps={{ htmlInput: { style: { fontFamily: MONO }, inputMode: 'tel' } }}
              />
              <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                {CANDIDATES.slice(0, 3).map((c) => (
                  <Box
                    key={c.phone}
                    component="button"
                    onClick={() => set({ phoneNumber: c.phone })}
                    sx={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 11,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider',
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                    }}
                  >
                    {c.name.split(' ')[0]}
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}
          {has('textNumberId') && (
            <TextField
              label={`Text number id${p.routeId === 'conversation-new' ? '' : ' (optional)'}`}
              value={p.textNumberId}
              onChange={(e) => set({ textNumberId: e.target.value.trim() })}
              slotProps={{ htmlInput: { style: { fontFamily: MONO } } }}
            />
          )}
          {has('customPath') && (
            <TextField
              label="Path"
              value={p.customPath}
              onChange={(e) => set({ customPath: e.target.value })}
              slotProps={{ htmlInput: { style: { fontFamily: MONO } } }}
            />
          )}
        </Section>
      )}

      {has('include') && (
        <Section
          title="Conversation actions · include"
          action={
            <Switch
              size="small"
              checked={p.includeEnabled}
              onChange={(e) => set({ includeEnabled: e.target.checked })}
            />
          }
        >
          {p.includeEnabled ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {INCLUDE_ACTIONS.map((a) => (
                <FormControlLabel
                  key={a.id}
                  label={
                    <span>
                      {a.label}{' '}
                      <Box component="span" sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary' }}>
                        {a.id}
                      </Box>
                    </span>
                  }
                  control={
                    <Checkbox
                      size="small"
                      checked={p.include.includes(a.id)}
                      onChange={(e) =>
                        set({
                          include: e.target.checked
                            ? INCLUDE_ACTIONS.map((x) => x.id).filter(
                                (id): id is IncludeAction => id === a.id || p.include.includes(id),
                              )
                            : p.include.filter((x) => x !== a.id),
                        })
                      }
                    />
                  }
                />
              ))}
            </Box>
          ) : (
            <Hint>No include param: every action is shown. That is what the in-app pop-out does.</Hint>
          )}
        </Section>
      )}

      {has('inboxFilters') && (
        <Section title="Inbox filters">
          <Stack direction="row" sx={{ gap: 1 }}>
            <TextField
              label="textNumberId"
              value={p.inboxTextNumberId}
              onChange={(e) => set({ inboxTextNumberId: e.target.value.trim() })}
            />
            <TextField
              label="broadcastId"
              value={p.inboxBroadcastId}
              onChange={(e) => set({ inboxBroadcastId: e.target.value.trim() })}
            />
          </Stack>
          <Stack direction="row">
            <FormControlLabel
              control={<Switch checked={p.inboxIsDone} onChange={(e) => set({ inboxIsDone: e.target.checked })} />}
              label="isDone"
            />
            <FormControlLabel
              control={
                <Switch checked={p.inboxAutoOptOut} onChange={(e) => set({ inboxAutoOptOut: e.target.checked })} />
              }
              label="tag=auto-opt-out"
            />
          </Stack>
        </Section>
      )}

      <Section title={join ? 'Query' : 'App flags'}>
        {!join && (
        <TextField
          select
          label="HideHeader"
          value={p.hideHeader}
          onChange={(e) => set({ hideHeader: e.target.value as typeof p.hideHeader })}
        >
          {HIDE_HEADER_VARIANTS.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              <Stack direction="row" sx={{ width: '100%', alignItems: 'center' }}>
                <Box sx={{ flex: 1, fontFamily: v.id === 'off' ? undefined : MONO, fontSize: 12.5 }}>{v.label}</Box>
                {v.id !== 'off' && (
                  <Typography sx={{ fontSize: 11, color: v.expectHidden ? 'success.main' : 'text.secondary' }}>
                    {v.expectHidden ? 'hides' : 'should not hide'}
                  </Typography>
                )}
              </Stack>
            </MenuItem>
          ))}
        </TextField>
        )}
        <TextField
          label="Extra query"
          placeholder="foo=bar&baz=1"
          value={p.extraQuery}
          onChange={(e) => set({ extraQuery: e.target.value })}
          slotProps={{ htmlInput: { style: { fontFamily: MONO } } }}
        />
        {join && <Hint>The join form reads no query parameters. Anything added here should change nothing.</Hint>}
      </Section>

      <Section title="Anatomy">
        <Stack sx={{ gap: 0.5, fontFamily: MONO, fontSize: 11.5 }}>
          <Row k="origin" v={built.origin} />
          <Row k="path" v={built.path} />
          {built.query.map((q, i) => (
            <Row key={i} k={`?${q.key}`} v={q.value} why={q.why} />
          ))}
        </Stack>
      </Section>
    </>
  );
}

function Row({ k, v, why }: { k: string; v: string; why?: string }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 1, alignItems: 'baseline' }}>
      <Box sx={{ color: 'primary.main', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k}</Box>
      <Box sx={{ wordBreak: 'break-all' }}>
        {v || <span style={{ opacity: 0.5 }}>(empty)</span>}
        {why && (
          <Box component="span" sx={{ display: 'block', fontFamily: 'inherit', fontSize: 10.5, color: 'text.secondary' }}>
            {why}
          </Box>
        )}
      </Box>
    </Box>
  );
}
