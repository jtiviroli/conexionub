'use client'

import React, {useEffect, useState} from 'react'
import Container from "@/components/container/Container";
import Link from "next/link";
import {get} from "@/utils/request";
import styles from './page.module.css'
import {notFound} from "next/navigation";
import {useParams} from 'next/navigation'

type ResourceResponse = {
    dc: {
        title: [{ language: string, title: string }],
        creator: string,
        type: string,
        contributor?: { author?: string[], advisor?: string[] },
        date: { available: Date, issued: Date },
        description?: [{ language: string, abstract: string }],
        format: string,
        subject?: string[],
        publisher?: string,
        rights?: string,
    },
    access: {
        collection: string,
        restriction: number,
        hash: string,
        name: string
    },
    collectionInfo?: {
        current: {
            id: string,
            name: string,
        },
        ancestors: [{ id: string, name: string }]
    }
}

export default function Resource() {
    const params = useParams() as { slug?: string }
    const slug = params.slug ?? ''

    const [resource, setResource] = useState<ResourceResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!slug) return
        let mounted = true
        const load = async () => {
            setLoading(true)
            try {
                const request = await get('/resource/' + slug)
                if (!mounted) return
                if (request.response.status !== 200) {
                    setError('Recurso no encontrado')
                    setResource(null)
                } else {
                    setResource(request.response.data as ResourceResponse)
                }
            } catch (e) {
                console.error('Error cargando recurso', e)
                if (!mounted) return
                setError('No se pudo cargar el recurso')
            } finally {
                if (!mounted) return
                setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [slug])

    if (!slug) return null
    if (loading) return (<Container id={slug} crumb={[<Link key={'repositorio'} href={'/repositorio'}>Repositorio</Link>]}>Cargando...</Container>)
    if (error) return (<Container id={slug} crumb={[<Link key={'repositorio'} href={'/repositorio'}>Repositorio</Link>]}> {error} </Container>)
    if (!resource) return notFound()

    const titleEs = resource.dc.title.find(title => title.language === 'es')?.title
    const descriptionEs = resource.dc.description?.find(d => d.language === 'es')?.abstract
    const issuedDate = resource.dc.date?.issued ? new Date(resource.dc.date.issued) : undefined
    const formattedDate = issuedDate ? issuedDate.toLocaleDateString('es-AR') : undefined
    const authors = resource.dc.contributor?.author?.length ? resource.dc.contributor.author.join(', ') : resource.dc.creator
    const fileHref = process.env.NEXT_PUBLIC_LORE_HOST + '/resource/' + slug + '/stream'
    const fileName = resource.access?.name ?? 'Ver recurso'
    const collectionId = resource.access?.collection ?? ''

    const collectionName = resource.collectionInfo?.current.name ?? 'Colección desconocida'
    const collectionCrumbs = resource.collectionInfo?.ancestors.reverse().map(ancestor => (
        <Link key={ancestor.id} href={'/repositorio/coleccion/' + ancestor.id}>{ancestor.name}</Link>
    )) ?? []

    return (
        <>
            <Container id={slug}
                       crumb={[<Link key={'repositorio'} href={'/repositorio'}>Repositorio</Link>,
                           <Link key={'cols'} href={'/repositorio/colecciones'}>Colecciones</Link>,
                           ...collectionCrumbs,
                           <Link key={'repo'} href={'/repositorio/coleccion/' + collectionId}>{collectionName}</Link>,
                           <Link key={'slug'} href={'#' + slug}>{titleEs}</Link>]}>
                <h1 className={styles['title']}>{titleEs}</h1>
                <div className={styles['resource-grid']}>
                    <aside className={styles['resource-info']}>
                        <div className={styles['resource-info__lead']}>
                            <p><strong>Ver</strong></p>
                            <Link className={styles['resource-info__button']} href={fileHref} target="_blank"
                                  rel="noopener noreferrer">{fileName}</Link>
                        </div>
                        <div>
                            <p><strong>Fecha</strong></p>
                            <p>{formattedDate ?? 'N/D'}</p>
                        </div>
                        <div>
                            <p><strong>Autor</strong></p>
                            <p>{authors ?? 'N/D'}</p>
                        </div>
                    </aside>

                    <div className={styles['resource-main'] + ' ' + styles['resource-main--box']}>
                        <h3 className={styles['resource-main__title']}>Descripción</h3>
                        <p>{descriptionEs ?? 'Sin descripción disponible.'}</p>
                        <div>
                            <p><strong>Identificador</strong></p>
                            <p>{slug}</p>
                        </div>
                        <div>
                            <p><strong>Colección</strong></p>
                            <Link className={styles['resource-info__button']}
                                  href={'/repositorio/coleccion/' + collectionId}
                                  rel="noopener noreferrer">{collectionName}</Link>
                        </div>
                    </div>
                </div>

            </Container>
        </>
    );
}