"use client"

import React, {useEffect, useState} from 'react'
import styles from '@/app/repositorio/page.module.css'
import {get} from '@/utils/request'
import ResourceCard from '@/components/card/ResourceCard'
import {Resource} from '@/types/resources'

type Props = {
    initialResources?: Resource[]
    initialHasMore?: boolean
    initialLastResource?: string | null
    baseEndpoint: string
    initialQuery?: string
    onSelectAction?: (resource: Resource) => void
}

export default function ResourceList({
                                          initialResources = [],
                                          initialHasMore = false,
                                          initialLastResource = null,
                                          baseEndpoint,
                                          initialQuery = '',
                                          onSelectAction,
                                      }: Props) {
    const [resources, setResources] = useState<Resource[]>(initialResources)
    const [hasMore, setHasMore] = useState<boolean>(initialHasMore)
    const [lastResource, setLastResource] = useState<string | null>(initialLastResource)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Sincronizar con props iniciales cuando cambian (por ejemplo, carga asíncrona en padre)
    useEffect(() => {
        setResources(initialResources)
    }, [initialResources])

    useEffect(() => {
        setHasMore(initialHasMore)
    }, [initialHasMore])

    useEffect(() => {
        setLastResource(initialLastResource)
    }, [initialLastResource])

    const buildUrl = (lastShown?: string | null) => {
        const base = baseEndpoint
        const q = initialQuery || ''
        if (lastShown) {
            const sep = q && q.includes('?') ? '&' : (q ? '&' : '?')
            return `${base}${q}${sep}lastResource=${encodeURIComponent(lastShown)}`
        }
        return `${base}${q}`
    }

    const loadMore = async () => {
        if (loading) return
        setLoading(true)
        setError(null)
        try {
            const lastShown = resources.length > 0 ? resources[resources.length - 1]._id : lastResource
            const url = buildUrl(lastShown)
            const res = await get(url)
            const data = res.response.data || {}
            const newResources: Resource[] = data.resources ?? []
            const newHasMore: boolean = data.hasMore ?? false
            const newLast: string | null = data.lastResource ?? null

            setResources(prev => [...prev, ...newResources])
            setHasMore(newHasMore)
            setLastResource(newLast)
        } catch (err) {
            console.error('Error cargando más recursos', err)
            setError('No se pudieron cargar más recursos')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {resources.length === 0 && <p>No hay recursos.</p>}
            {resources.map(r => (
                <ResourceCard key={r._id} resource={r} onSelectAction={onSelectAction} />
            ))}

            {error && <p style={{color: 'var(--error, #b00020)'}}>{error}</p>}

            {hasMore ? (
                <div style={{marginTop: '1rem'}}>
                    <button onClick={loadMore} disabled={loading} className={styles['see-more']}>
                        {loading ? 'Cargando...' : 'Ver más'}
                    </button>
                </div>
            ) : null}
        </div>
    )
}
