# Incident Postmortem: Redis Cache Eviction Incident (2026-08-14)

## Summary
At 14:10 UTC on August 14, 2026, our primary Redis caching cluster reached maximum allocated memory (64 GB) following a marketing notification burst. Because the `maxmemory-policy` was misconfigured to `noeviction` instead of `volatile-lru`, Redis began rejecting write requests with OOM errors. 

## Root Cause
Configuration drift occurred during the July infrastructure migration. The default cluster parameter group omitted the eviction policy override, defaulting to `noeviction`.

## Action Items
1. Update Terraform configuration to explicitly lock `maxmemory-policy: allkeys-lru` across all cluster environments.
2. Introduce a synthetic canary alerting when cluster memory exceeds 75% capacity.
3. Conduct monthly automated drift detection between staging and production Redis parameter groups.
