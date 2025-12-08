'use client'

import React, {useEffect, useState} from "react";
import Container from "@/components/container/Container";
import Link from "next/link";
import {get} from "@/utils/request";
import styles from './page.module.css'
import {Resource} from '@/types/resources'
import ResourceList from '@/components/list/ResourceList'

export default function Repositorio() {
    const [resources, setResources] = useState<Resource[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [lastResource, setLastResource] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        let mounted = true
        const load = async () => {
            setError(null)
            setLoading(true)
            try {
                const request = await get('/resources?pageSize=5&desc=true')
                if (!mounted) return
                const res = Array.isArray(request.response.data?.resources) ? request.response.data.resources as Resource[] : []
                setResources(res)
                setHasMore(!!request.response.data?.hasMore)
                setLastResource(request.response.data?.lastResource ?? null)
            } catch (e) {
                console.error('Error cargando recursos', e)
                if (!mounted) return
                setError('No se pudieron cargar recursos')
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    return (
        <>
            <Container id={'ultimas'} crumb={['Repositorio',
                <Link key={'Últimas adiciones'} href={'#ultimas'}>Últimas adiciones</Link>]}>
                <h1 className={styles['title']}>Últimas adiciones</h1>

                {error && <p style={{color: 'var(--error, #b00020)'}}>{error}</p>}

                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <ResourceList
                        initialResources={resources}
                        initialHasMore={hasMore}
                        initialLastResource={lastResource}
                        baseEndpoint={'/resources'}
                        initialQuery={'?pageSize=5&desc=true'}
                    />
                )}

                {hasMore && !loading && (
                    <Link href={'/repositorio'} className={styles['see-more']}>
                        Ver más
                    </Link>
                )}
            </Container>
        </>
    )
}